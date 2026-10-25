import fs from "node:fs";
import path from "node:path";

const DEFAULT_SHIP_ROOT = "C:\\Users\\11873\\Desktop\\ship";
const shipRoot = path.resolve(process.argv[process.argv.indexOf("--ship-root") + 1] || DEFAULT_SHIP_ROOT);
const outArg = process.argv.indexOf("--out");
const outPath = path.resolve(outArg >= 0 && process.argv[outArg + 1] ? process.argv[outArg + 1] : path.join(process.cwd(), "hot100-narration-audit.json"));

const forbidden = [
  "看图里",
  "图里",
  "先看图里",
  "跟着样例图",
  "最后看边界图",
  "这一版是",
  "当前 PDF",
  "没有匹配",
  "Python3.9",
  "先承认",
  "承认暴力",
  "pdf 文件夹",
  "…",
  "->",
  "→",
];

const mojibake = [/�/, /鍏|鐪|銆|乧|孫|虏|锛|绋|涓/];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function extractSlides(appJs) {
  const marker = "\nconst stage=";
  const end = appJs.indexOf(marker);
  if (end < 0) throw new Error("cannot find const stage marker");
  const prefix = "const slides=";
  if (!appJs.startsWith(prefix)) throw new Error("app.js does not start with const slides=");
  return JSON.parse(appJs.slice(prefix.length, end).trim().replace(/;$/, ""));
}

function generatedProjects(root) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .filter((project) => fs.existsSync(path.join(project, ".generated-hot100")))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
}

function normalized(value) {
  return String(value ?? "").replace(/\s+/g, "").replace(/[，。；：,.、:]/g, "");
}

const report = {
  shipRoot,
  generatedAt: new Date().toISOString(),
  totals: {
    projects: 0,
    slides: 0,
    draftSegments: 0,
    spokenSegments: 0,
    silentSegments: 0,
    needsSplit: 0,
    issueCount: 0,
  },
  splitSuggestions: [],
  animationChangeCandidates: [],
  issues: [],
};

for (const project of generatedProjects(shipRoot)) {
  const slug = path.basename(project);
  const appPath = path.join(project, "presentation", "app.js");
  const draftPath = path.join(project, "audio-segments.draft.json");
  if (!fs.existsSync(draftPath)) {
    report.issues.push({ slug, severity: "error", reason: "missing draft file" });
    continue;
  }
  let slides = [];
  try {
    slides = extractSlides(fs.readFileSync(appPath, "utf8"));
  } catch (error) {
    report.issues.push({ slug, severity: "error", reason: "cannot parse slides", detail: String(error.message || error) });
  }
  const segments = readJson(draftPath);
  report.totals.projects += 1;
  report.totals.slides += slides.length;
  report.totals.draftSegments += segments.length;
  report.totals.spokenSegments += segments.filter((segment) => !segment.silent).length;
  report.totals.silentSegments += segments.filter((segment) => segment.silent).length;

  if (segments.length !== slides.length) {
    report.issues.push({ slug, severity: "error", reason: "draft count differs from slide count", slides: slides.length, segments: segments.length });
    report.animationChangeCandidates.push({ slug, reason: "draft count differs from slide count" });
  }

  segments.forEach((segment, index) => {
    const text = String(segment.text ?? "");
    const slide = slides[index] || {};
    const step = segment.step ?? index + 1;
    const base = { slug, step, title: slide.title || segment.source?.title || "" };

    if (!segment.silent && !text.trim()) {
      report.issues.push({ ...base, severity: "error", reason: "empty spoken segment" });
    }
    if (text.length > 115) {
      report.totals.needsSplit += 1;
      report.splitSuggestions.push({ ...base, length: text.length, text });
      if (!segment.needsSplit) {
        report.issues.push({ ...base, severity: "warn", reason: "long text is not marked needsSplit", length: text.length });
      }
    }
    if (!segment.silent && text.length < 12) {
      report.issues.push({ ...base, severity: "warn", reason: "spoken segment too short", text });
    }
    for (const phrase of forbidden) {
      if (text.includes(phrase)) {
        report.issues.push({ ...base, severity: "error", reason: "forbidden phrase", phrase, text });
      }
    }
    if (/[：:]\s*[。；;，,]/.test(text) || /：\s*$/.test(text)) {
      report.issues.push({ ...base, severity: "error", reason: "empty clause after punctuation", text });
    }
    if (/\w+=\[/.test(text) || /\[[^\]]+\]/.test(text)) {
      report.issues.push({ ...base, severity: "error", reason: "raw bracket/list expression may be misread by TTS", text });
    }
    if (/O\([^)]+\)/.test(text)) {
      report.issues.push({ ...base, severity: "error", reason: "raw complexity expression may be misread by TTS", text });
    }
    for (const pattern of mojibake) {
      if (pattern.test(text)) {
        report.issues.push({ ...base, severity: "error", reason: "mojibake-like text", pattern: String(pattern), text });
      }
    }
    const titleNorm = normalized(slide.title || segment.source?.title || "");
    const textNorm = normalized(text);
    if (titleNorm && textNorm === titleNorm) {
      report.issues.push({ ...base, severity: "error", reason: "text only repeats title", text });
    }
    if (!segment.silent && !String(segment.audio || "").endsWith(`${step}.wav`)) {
      report.issues.push({ ...base, severity: "warn", reason: "audio path does not match step", audio: segment.audio });
    }
    if (segment.needsAnimationReview) {
      report.animationChangeCandidates.push({ ...base, reason: "draft marked needsAnimationReview" });
    }
  });
}

report.totals.issueCount = report.issues.length;
writeJson(outPath, report);

const summary = {
  projects: report.totals.projects,
  slides: report.totals.slides,
  draftSegments: report.totals.draftSegments,
  spokenSegments: report.totals.spokenSegments,
  silentSegments: report.totals.silentSegments,
  needsSplit: report.totals.needsSplit,
  issueCount: report.totals.issueCount,
  animationChangeCandidates: report.animationChangeCandidates.length,
  report: outPath,
};
console.log(JSON.stringify(summary, null, 2));
process.exit(report.issues.some((issue) => issue.severity === "error") ? 1 : 0);
