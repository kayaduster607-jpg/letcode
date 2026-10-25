import json
import logging
import re
import unicodedata
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PDF_ROOT = ROOT / "代码随想录算法PDF"


def extract_problems():
    text = (ROOT / "src/data/problems.ts").read_text(encoding="utf-8")
    marker = "export const problems: Problem[] = "
    marker_index = text.index(marker)
    start = text.index("[", marker_index + len(marker))
    end = text.rindex("];")
    return json.loads(text[start : end + 1])


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKC", text or "")
    return re.sub(r"\s+", "", text).lower()


def page_texts():
    logging.getLogger("pypdf").setLevel(logging.ERROR)
    pages = []
    for pdf in PDF_ROOT.glob("*.pdf"):
        reader = PdfReader(str(pdf))
        for index, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""
            if text.strip():
                pages.append(
                    {
                        "pdf": pdf.name,
                        "page": index,
                        "text": text,
                        "norm": normalize(text),
                    }
                )
    return pages


def find_match(problem, pages):
    title = normalize(problem["title"])
    title_en = normalize(problem["titleEn"])
    leetcode_id = str(problem["leetcodeId"])

    candidates = []
    for page in pages:
        score = 0
        norm = page["norm"]
        if title and title not in norm and title_en and title_en not in norm:
            continue
        if title and title in norm:
            score += 100
        if leetcode_id and re.search(rf"(^|[^0-9]){re.escape(leetcode_id)}([^0-9]|$)", page["text"]):
            score += 20
        if title_en and title_en in norm:
            score += 30
        if "大纲" in page["text"] or "目录" in page["text"] or "本PDF覆盖" in page["text"]:
            score -= 50
        if score:
            candidates.append((score, page))

    if not candidates:
        return None

    candidates.sort(key=lambda item: (-item[0], item[1]["pdf"], item[1]["page"]))
    score, page = candidates[0]
    snippet = re.sub(r"\s+", " ", page["text"]).strip()
    return {
        "pdf": page["pdf"],
        "page": page["page"],
        "score": score,
        "snippet": snippet[:1400],
    }


def main():
    problems = extract_problems()
    pages = page_texts()
    result = []
    matched = 0

    for problem in problems:
        match = find_match(problem, pages)
        if match:
            matched += 1
        result.append(
            {
                "id": problem["id"],
                "leetcodeId": problem["leetcodeId"],
                "title": problem["title"],
                "slug": problem["slug"],
                "category": problem["category"],
                "source": match,
            }
        )

    out = ROOT / "scripts" / "hot100_pdf_sources.json"
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"problems": len(problems), "matched": matched, "output": str(out)}, ensure_ascii=False, indent=2))

    for item in result:
        if item["source"]:
            print(f"OK #{item['leetcodeId']} {item['title']} -> {item['source']['pdf']} p{item['source']['page']}")
        else:
            print(f"-- #{item['leetcodeId']} {item['title']} no direct PDF page")


if __name__ == "__main__":
    main()
