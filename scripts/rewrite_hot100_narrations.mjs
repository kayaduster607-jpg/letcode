import fs from "node:fs";
import path from "node:path";

const DEFAULT_SHIP_ROOT = "C:\\Users\\11873\\Desktop\\ship";
const FORBIDDEN_PREFIXES = [
  /^先看图里的?/,
  /^看图里的?/,
  /^跟着样例图走一遍：?/,
  /^按图里的主线执行：?/,
  /^按图一步一步执行：?/,
  /^最后看边界图：?/,
  /^最后对照 Python 代码，?/,
  /^看清输入、输出和边界三件事：?/,
  /^先看直接做法怎么跑：?/,
];

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const shipRoot = path.resolve(arg("--ship-root", DEFAULT_SHIP_ROOT));
const summaryPath = path.resolve(arg("--summary", path.join(process.cwd(), "hot100-narration-draft-summary.json")));

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function compact(value, max = 120) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/Python3\.9/g, "Python")
    .replace(/->/g, "到")
    .replace(/…/g, "")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function cleanCaption(value) {
  let text = String(value ?? "").replace(/\s+/g, " ").trim();
  for (const pattern of FORBIDDEN_PREFIXES) {
    text = text.replace(pattern, "");
  }
  text = text
    .replace(/这一版是/g, "这里是")
    .replace(/有向图里/g, "有向图中")
    .replace(/看图里/g, "")
    .replace(/图里/g, "")
    .trim();
  return limitSpeech(makeTtsFriendly(text), 180);
}

function extractSlides(appJs) {
  const marker = "\nconst stage=";
  const end = appJs.indexOf(marker);
  if (end < 0) throw new Error("cannot find const stage marker");
  const prefix = "const slides=";
  if (!appJs.startsWith(prefix)) throw new Error("app.js does not start with const slides=");
  const jsonText = appJs.slice(prefix.length, end).trim().replace(/;$/, "");
  return JSON.parse(jsonText);
}

function labelPairs(items = [], maxItems = 3) {
  return items
    .slice(0, maxItems)
    .map((item) => {
      if (typeof item === "string") return limitSpeech(makeTtsFriendly(item), 48);
      const label = compact(item.label ?? item.name ?? "", 18);
      const value = limitSpeech(makeTtsFriendly(item.value ?? item.note ?? item.cost ?? ""), 54);
      return label && value ? `${label}是${value}` : compact(label || value, 54);
    })
    .filter(Boolean);
}

function codeSignals(code = "") {
  const lines = String(code)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const signals = [];
  for (const line of lines) {
    if (/^def\s+/.test(line)) signals.push("函数入口和参数");
    if (/for\s+.+\s+in\s+/.test(line)) signals.push("for 循环推进顺序");
    if (/while\s+/.test(line)) signals.push("while 循环停止条件");
    if (/return\s+/.test(line)) signals.push("return 返回值");
    if (signals.length >= 3) break;
  }
  return [...new Set(signals)];
}

function digitWord(ch) {
  return {
    0: "零",
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    5: "五",
    6: "六",
    7: "七",
    8: "八",
    9: "九",
  }[ch] || ch;
}

function sayNumber(raw) {
  const value = String(raw);
  if (value.startsWith("-")) return `负${sayNumber(value.slice(1))}`;
  if (/^\d$/.test(value)) return digitWord(value);
  return value;
}

function sayList(raw) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (/^-?\d+$/.test(item) ? sayNumber(item) : item))
    .join("、");
}

function sayComplexity(raw) {
  return String(raw)
    .replace(/\+/g, " 加 ")
    .replace(/\*/g, " 乘 ")
    .replace(/max/gi, "max")
    .replace(/log/gi, "log")
    .replace(/[()]/g, " ")
    .replace(/\bn\b/g, "N")
    .replace(/\bm\b/g, "M")
    .replace(/\bh\b/g, "H")
    .replace(/\bw\b/g, "W")
    .replace(/\bV\b/g, "V")
    .replace(/\bE\b/g, "E")
    .replace(/\bS\b/g, "S")
    .replace(/输出字符串长度/g, "输出长度")
    .replace(/嵌套深度/g, "嵌套深度")
    .replace(/\s+/g, " ")
    .trim();
}

function makeTtsFriendly(text) {
  let out = String(text ?? "");
  out = out
    .replace(/Python3\.9/g, "Python")
    .replace(/有向图里/g, "有向图中")
    .replace(/null/g, "空")
    .replace(/O\(([^)]*)\)/g, (_, body) => `O ${sayComplexity(body)}`);
  for (let i = 0; i < 6 && /\[[^\[\]]*\]/.test(out); i += 1) {
    out = out.replace(/(\w+)=\[([^\[\]]*)\]/g, (_, name, body) => `${name} 是 ${sayList(body)}`);
    out = out.replace(/\[([^\[\]]*)\]/g, (_, body) => `序列 ${sayList(body)}`);
  }
  out = out
    .replace(/->/g, "到")
    .replace(/[\[\]]/g, "")
    .replace(/(\d+)\s*→\s*(\d+)\s*→\s*(\d+)/g, (_, a, b, c) => `${sayNumber(a)} 指向 ${sayNumber(b)}，${sayNumber(b)} 指向 ${sayNumber(c)}`)
    .replace(/→/g, "到")
    .replace(/==/g, "等于")
    .replace(/!=/g, "不等于")
    .replace(/<=/g, "小于等于")
    .replace(/>=/g, "大于等于")
    .replace(/%/g, "取模")
    .replace(/\.\./g, " 到 ")
    .replace(/…/g, "")
    .replace(/序列\s+序列/g, "多个结果序列")
    .replace(/prerequisites 是\s*到 true/g, "没有依赖时返回 true")
    .replace(/到\s+序列([。；，,]|$)/g, "到空结果$1")
    .replace(/期望是序列([。；，,]|$)/g, "期望是空结果$1")
    .replace(/；+/g, "；")
    .replace(/。；/g, "。")
    .replace(/：。/g, "：")
    .replace(/\s+/g, " ")
    .trim();
  return out;
}

function limitSpeech(text, max = 130) {
  let out = String(text ?? "").replace(/\s+/g, " ").trim();
  if (out.length <= max) return out;
  const slice = out.slice(0, max);
  const cut = Math.max(slice.lastIndexOf("。"), slice.lastIndexOf("；"), slice.lastIndexOf("，"));
  if (cut > 32) out = slice.slice(0, cut);
  else out = slice;
  return out.replace(/[，；：、,.:\s]+$/g, "").trim();
}

function classify(slide) {
  const visual = slide.visual || "";
  const scene = slide.scene || "";
  const title = slide.title || "";
  const eyebrow = String(slide.eyebrow || "").toUpperCase();
  if (eyebrow.includes("READ")) return "read";
  if (eyebrow.includes("INPUT") || eyebrow.includes("OUTPUT")) return "io";
  if (eyebrow.includes("EXAMPLE")) return "sample";
  if (eyebrow.includes("DIRECT")) return "direct";
  if (eyebrow.includes("BOTTLENECK")) return "bottleneck";
  if (eyebrow.includes("PATTERN") || eyebrow.includes("CORE")) return "pattern";
  if (eyebrow.includes("WALK")) return "walk";
  if (eyebrow.includes("EDGE")) return "edge";
  if (eyebrow.includes("CODE")) return visual === "codeFocus" ? "codeFocus" : "code";
  if (eyebrow.includes("REVIEW")) return "review";
  if (visual === "code") return "code";
  if (visual === "codeFocus") return "codeFocus";
  if (visual === "review" || /review|取舍|多解|比较/.test(scene + title)) return "review";
  if (/edge|边界/.test(scene + title)) return "edge";
  if (/sample|样例/.test(scene + title)) return "sample";
  if (/direct|暴力|直接/.test(scene + title)) return "direct";
  if (/bottleneck|卡点|重复|瓶颈/.test(scene + title)) return "bottleneck";
  if (/pattern|优化|推荐|结构|核心/.test(scene + title)) return "pattern";
  if (/walk|执行|推演|路径|步骤/.test(scene + title)) return "walk";
  if (/io|input|output|输入|输出/.test(scene + title)) return "io";
  return "read";
}

function sentenceFromCards(cards, maxItems = 3) {
  const pairs = labelPairs(cards, 4);
  if (!pairs.length) return "";
  return pairs.slice(0, maxItems).join("；");
}

function sentenceFromCardsByLabel(cards, allowedLabels, maxItems = 3) {
  const allowed = new Set(allowedLabels);
  return sentenceFromCards(
    (cards || []).filter((item) => allowed.has(String(item.label || "").trim())),
    maxItems,
  );
}

function narrate(slide, index, total) {
  const mode = classify(slide);
  const title = compact(slide.title, 42);
  const caption = cleanCaption(slide.caption);
  const shortCaption = limitSpeech(caption, 68);
  const cards = sentenceFromCards(slide.cards || [], 3);
  const readCards = sentenceFromCardsByLabel(slide.cards || [], ["目标", "输入对象", "返回值", "对象", "输入", "输出"], 3);
  const ioCards = sentenceFromCardsByLabel(slide.cards || [], ["输入", "输出", "返回值", "边界", "期望"], 3);
  const items = labelPairs(slide.items || [], 3);
  const metrics = labelPairs(slide.metrics || [], 2);
  const variants = (slide.variants || [])
    .slice(0, 4)
    .map((item) => `${compact(item.name, 18)}：${limitSpeech(makeTtsFriendly(item.note || item.cost || ""), 42)}`)
    .filter((item) => !item.endsWith("："));
  const kind = slide.kind || slide.scene || "";

  let text = "";
  if (mode === "read") {
    const detail = limitSpeech(readCards || shortCaption, 86);
    text = `${title}要解决的是：${detail}。先确认输入、输出和限制。`;
  } else if (mode === "io") {
    text = `这一幕只定边界：${limitSpeech(ioCards || cards || shortCaption, 86)}。写代码前先把返回值和特殊输入摆正。`;
  } else if (mode === "sample") {
    text = `样例先跑通：${shortCaption}。重点是看出每一步为什么得到这个输出。`;
  } else if (mode === "direct") {
    const detail = compact(items.length ? items.join("；") : shortCaption, 82);
    text = `直接做法这样跑：${detail}。先看清求解过程，再找重复。`;
  } else if (mode === "bottleneck") {
    const detail = compact(items.length ? items.join("；") : shortCaption, 82);
    text = `瓶颈在这里：${detail}。这一步如果反复发生，复杂度就会被拉高。`;
  } else if (mode === "pattern") {
    const detail = compact(items.length ? items.join("；") : metrics.length ? metrics.join("；") : shortCaption, 82);
    text = `推荐写法保护这些状态：${detail}。代码重点是更新顺序。`;
  } else if (mode === "walk") {
    const detail = compact(items.length ? items.join("；") : shortCaption, 84);
    text = `现在推进当前轮：${detail}。注意状态怎么变到下一步。`;
  } else if (mode === "edge") {
    text = `边界用来兜底：${compact(cards || shortCaption, 82)}。这些情况要提前想清楚。`;
  } else if (mode === "codeFocus") {
    const detail = compact(items.length ? items.join("；") : shortCaption, 82);
    text = `代码骨架先看：${detail}。手写时先稳住变量含义和循环条件。`;
  } else if (mode === "code") {
    const signals = codeSignals(slide.code || "");
    const detail = compact(signals.length ? signals.join("；") : shortCaption, 86);
    text = `这份 Python 代码重点看：${detail}。缩进按层级读，先看变量更新，再看 return。`;
  } else if (mode === "review") {
    const detail = compact(variants.length ? variants.join("；") : shortCaption, 86);
    text = `最后做取舍：${detail}。提交时优先选稳定、复杂度合适的写法。`;
  }

  text = limitSpeech(makeTtsFriendly(text.replace(/。。+/g, "。")), 126);
  const silent = false;
  const needsSplit = text.length > 115;
  const needsAnimationReview =
    needsSplit ||
    text.length < 12 ||
    /先看图里|跟着样例图|最后看边界图|这一版是|当前 PDF|没有匹配|Python3\.9/.test(text) ||
    (mode !== "code" && /代码重点对照/.test(text));

  return {
    chapter: slide.slug || "",
    step: index + 1,
    text,
    audio: `${slide.slug || ""}/${index + 1}.wav`,
    silent,
    needsSplit,
    needsAnimationReview,
    source: {
      title: slide.title || "",
      visual: slide.visual || "",
      scene: slide.scene || "",
      kind,
      oldCaption: slide.caption || "",
      totalSteps: total,
    },
  };
}

function scriptMarkdown(project, slides, segments) {
  const title = slides[0]?.title || project.name;
  const lines = [
    `# ${title} 口播稿（draft）`,
    "",
    "> 这是根据当前动画逐幕重写的口播草稿。审计通过前不覆盖正式 audio-segments.json。",
    "",
  ];
  for (const segment of segments) {
    const sourceTitle = segment.source.title || `第 ${segment.step} 幕`;
    lines.push(`## ${String(segment.step).padStart(2, "0")} ${sourceTitle}`);
    lines.push(segment.silent ? "_silent_" : segment.text);
    if (segment.needsSplit) lines.push("");
    if (segment.needsSplit) lines.push("> 建议拆 step：这一段偏长。");
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

function generatedProjects(root) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, entry.name))
    .filter((project) => fs.existsSync(path.join(project, ".generated-hot100")))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
}

const projects = generatedProjects(shipRoot);
const summary = {
  shipRoot,
  generatedAt: new Date().toISOString(),
  projects: [],
  totals: {
    projects: 0,
    slides: 0,
    draftSegments: 0,
    silent: 0,
    needsSplit: 0,
    needsAnimationReview: 0,
  },
};

for (const project of projects) {
  const appPath = path.join(project, "presentation", "app.js");
  if (!fs.existsSync(appPath)) continue;
  const slides = extractSlides(fs.readFileSync(appPath, "utf8"));
  const segments = slides.map((slide, index) => narrate(slide, index, slides.length));
  for (const segment of segments) {
    if (!segment.chapter) segment.chapter = path.basename(project);
    if (!segment.audio.startsWith(`${path.basename(project)}/`)) {
      segment.audio = `${path.basename(project)}/${segment.step}.wav`;
    }
  }

  const draftPath = path.join(project, "audio-segments.draft.json");
  const scriptPath = path.join(project, "script.md");
  writeJson(draftPath, segments);
  fs.writeFileSync(scriptPath, scriptMarkdown({ name: path.basename(project) }, slides, segments), "utf8");

  const item = {
    slug: path.basename(project),
    slides: slides.length,
    draftSegments: segments.filter((segment) => !segment.silent).length,
    silent: segments.filter((segment) => segment.silent).length,
    needsSplit: segments.filter((segment) => segment.needsSplit).map((segment) => segment.step),
    needsAnimationReview: segments.filter((segment) => segment.needsAnimationReview).map((segment) => segment.step),
  };
  summary.projects.push(item);
  summary.totals.projects += 1;
  summary.totals.slides += slides.length;
  summary.totals.draftSegments += item.draftSegments;
  summary.totals.silent += item.silent;
  summary.totals.needsSplit += item.needsSplit.length;
  summary.totals.needsAnimationReview += item.needsAnimationReview.length;
}

writeJson(summaryPath, summary);
console.log(JSON.stringify(summary.totals, null, 2));
console.log(`summary: ${summaryPath}`);
