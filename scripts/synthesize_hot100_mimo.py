"""Parallel MiMo TTS for Hot100 web-video presentations.

Reads ship/<slug>/audio-segments.json and writes:
  ship/<slug>/presentation/audio/<slug>/<step>.wav

Draft files are intentionally ignored. Promote reviewed drafts to
audio-segments.json before running this script.
"""

from __future__ import annotations

import argparse
import base64
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import json
import os
import random
import sys
import threading
import time
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import ProxyHandler, Request, build_opener


API_URLS = [
    "https://token-plan-cn.xiaomimimo.com/v1/chat/completions",
    "https://api.xiaomimimo.com/v1/chat/completions",
]
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SHIP_ROOT = PROJECT_ROOT / "ship"
DEFAULT_VOICE_SAMPLE = (
    DEFAULT_SHIP_ROOT
    / "dp-edit-distance-video"
    / "presentation"
    / "audio"
    / "edit-distance"
    / "1.wav"
)
DEFAULT_LOG_DIR = PROJECT_ROOT / "tts-logs"

STYLE_PROMPT = (
    "请使用同一个稳定的甜美女声和自然讲课质感，像耐心的算法老师在带同学刷题。"
    "语速中等，轻松但清楚，不要播音腔、客服腔或机器人节奏。"
    "每一段都必须保持同一个人、同一种音色、同一种距离感，不要忽然换成另一个声音。"
    "英文变量名和技术词不要翻译成中文，要按英文自然读出来，例如 nums、target、key、value、Python、LeetCode。"
    "复杂度不要读成长串英文；O(n) 读作 O N，O(1) 读作 O 一，O(n^2) 读作 O N 平方。"
)


def naturalize_for_tts(text: str) -> str:
    spoken = str(text or "").replace("`", "")
    replacements = {
        "Python3.9": "Python",
        "O(n²)": "O N 平方",
        "O(n^2)": "O N 平方",
        "O(n log n)": "O N log N",
        "O(log n)": "O log N",
        "O(m*n)": "O M 乘 N",
        "O(mn)": "O M 乘 N",
        "O(m+n)": "O M 加 N",
        "O(n)": "O N",
        "O(1)": "O 一",
    }
    for before, after in replacements.items():
        spoken = spoken.replace(before, after)
    spoken = " ".join(spoken.split()).strip("，。；; ")
    if spoken and not spoken.endswith(("。", "！", "？")):
        spoken += "。"
    return spoken


def make_voiceclone_data(sample_path: Path) -> str:
    voice_bytes = sample_path.read_bytes()
    voice_base64 = base64.b64encode(voice_bytes).decode("utf-8")
    return f"data:audio/wav;base64,{voice_base64}"


def post_tts(text: str, style: str, api_key: str, voice: str, mode: str, voice_sample: str | None) -> bytes:
    audio_options = {"format": "wav"}
    if mode == "voiceclone":
        if not voice_sample:
            raise ValueError("voiceclone mode requires a voice sample")
        model = "mimo-v2.5-tts-voiceclone"
        audio_options["voice"] = voice_sample
    elif mode == "builtin":
        model = "mimo-v2.5-tts"
        audio_options["voice"] = voice
    else:
        model = "mimo-v2.5-tts-voicedesign"
        audio_options["optimize_text_preview"] = True

    payload = json.dumps(
        {
            "model": model,
            "messages": [
                {"role": "user", "content": style},
                {"role": "assistant", "content": text},
            ],
            "audio": audio_options,
        },
        ensure_ascii=False,
    ).encode("utf-8")

    opener = build_opener(ProxyHandler({}))
    last_error = None
    for api_url in API_URLS:
        req = Request(api_url, data=payload, method="POST")
        req.add_header("api-key", api_key)
        req.add_header("Content-Type", "application/json")
        try:
            with opener.open(req, timeout=120) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            break
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            last_error = RuntimeError(f"{api_url} HTTP {exc.code}: {body[:500]}")
            if exc.code != 401:
                raise last_error from exc
    else:
        raise last_error or RuntimeError("MiMo TTS request failed")

    audio_b64 = data.get("choices", [{}])[0].get("message", {}).get("audio", {}).get("data")
    if not audio_b64:
        raise ValueError(f"No audio data in response: {json.dumps(data, ensure_ascii=False)[:500]}")
    return base64.b64decode(audio_b64)


def iter_projects(root: Path, slug: str | None, segments_file: str):
    if slug:
        candidates = [root / slug]
    else:
        candidates = [
            path
            for path in root.iterdir()
            if path.is_dir() and (path / ".generated-hot100").exists()
        ]
    for project in sorted(candidates, key=lambda item: item.name):
        segments_path = project / segments_file
        if segments_path.exists():
            yield project, json.loads(segments_path.read_text(encoding="utf-8"))


def atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_name(f".{path.stem}.{os.getpid()}.{threading.get_ident()}.tmp{path.suffix}")
    tmp_path.write_bytes(data)
    tmp_path.replace(path)


def build_tasks(projects, force: bool):
    tasks = []
    skipped = 0
    for project, segments in projects:
        for segment in segments:
            if segment.get("silent"):
                skipped += 1
                continue
            chapter = segment["chapter"]
            step = segment["step"]
            out_path = project / "presentation" / "audio" / chapter / f"{step}.wav"
            if out_path.exists() and out_path.stat().st_size > 0 and not force:
                skipped += 1
                continue
            tasks.append(
                {
                    "project": project.name,
                    "chapter": chapter,
                    "step": step,
                    "text": segment["text"],
                    "out_path": out_path,
                }
            )
    return tasks, skipped


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ship-root", default=str(DEFAULT_SHIP_ROOT))
    parser.add_argument("--slug", default=None, help="Only synthesize one problem slug")
    parser.add_argument("--exclude-slug", action="append", default=[], help="Skip one slug; can be passed multiple times")
    parser.add_argument("--limit-projects", type=int, default=0, help="Limit number of projects for a batch")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--voice", default="冰糖", help="MiMo built-in voice, used only in builtin mode")
    parser.add_argument("--mode", choices=["voiceclone", "builtin", "voicedesign"], default="builtin")
    parser.add_argument("--voice-sample", default=str(DEFAULT_VOICE_SAMPLE))
    parser.add_argument("--segments-file", default="audio-segments.json")
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--retries", type=int, default=4)
    parser.add_argument("--retry-delay", type=float, default=2.0)
    parser.add_argument("--log-dir", default=str(DEFAULT_LOG_DIR))
    args = parser.parse_args()

    root = Path(args.ship_root)
    log_dir = Path(args.log_dir)
    log_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    run_log = log_dir / f"tts-run-{stamp}.jsonl"
    failures_path = log_dir / f"tts-failures-{stamp}.json"
    log_lock = threading.Lock()

    # Credentials must be supplied by the calling process, never an implicit file.
    api_key = os.environ.get("MIMO_API_KEY", "")
    if not api_key or api_key == "在这里填入你的key":
        print("[ERR] MIMO_API_KEY not found.", file=sys.stderr)
        return 1

    voice_sample = None
    if args.mode == "voiceclone":
        sample_path = Path(args.voice_sample)
        if not sample_path.exists():
            print(f"[ERR] voice sample not found: {sample_path}", file=sys.stderr)
            return 1
        voice_sample = make_voiceclone_data(sample_path)

    excluded = {slug.strip() for value in args.exclude_slug for slug in value.split(",") if slug.strip()}
    projects = [
        (project, segments)
        for project, segments in iter_projects(root, args.slug, args.segments_file)
        if project.name not in excluded
    ]
    if args.limit_projects:
        projects = projects[: args.limit_projects]

    tasks, skipped = build_tasks(projects, args.force)
    total = len(tasks)
    print(f">> Synthesizing {len(projects)} projects, {total} pending segments, {skipped} skipped")
    if total == 0:
        print("Done: nothing to synthesize")
        return 0

    counters = {"ok": 0, "failed": 0}
    failures = []

    def log_event(event: dict) -> None:
        with log_lock:
            with run_log.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(event, ensure_ascii=False) + "\n")

    def synthesize_one(task: dict) -> dict:
        text = naturalize_for_tts(task["text"])
        last_error = None
        for attempt in range(1, args.retries + 1):
            try:
                audio = post_tts(text, STYLE_PROMPT, api_key, args.voice, args.mode, voice_sample)
                atomic_write(task["out_path"], audio)
                return {**task, "status": "ok", "bytes": len(audio), "attempt": attempt}
            except Exception as exc:  # noqa: BLE001 - keep batch alive and report exact failure.
                last_error = str(exc)
                if attempt < args.retries:
                    sleep_for = args.retry_delay * attempt + random.random()
                    time.sleep(sleep_for)
        return {**task, "status": "failed", "error": last_error or "unknown error", "attempt": args.retries}

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = [pool.submit(synthesize_one, task) for task in tasks]
        for index, future in enumerate(as_completed(futures), 1):
            result = future.result()
            log_event(
                {
                    "time": datetime.now().isoformat(timespec="seconds"),
                    **{key: str(value) if isinstance(value, Path) else value for key, value in result.items()},
                }
            )
            if result["status"] == "ok":
                counters["ok"] += 1
                print(f"[{index}/{total}] OK {result['project']}/{result['chapter']}/{result['step']}.wav")
            else:
                counters["failed"] += 1
                failures.append({key: str(value) if isinstance(value, Path) else value for key, value in result.items()})
                print(
                    f"[{index}/{total}] FAIL {result['project']}/{result['chapter']}/{result['step']}: {result['error']}",
                    file=sys.stderr,
                )

    if failures:
        failures_path.write_text(json.dumps(failures, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nDone: {counters['ok']} created, {skipped} skipped, {counters['failed']} failed")
    print(f"log: {run_log}")
    if failures:
        print(f"failures: {failures_path}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
