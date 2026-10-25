import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

// Accept the generated resource root explicitly, with a portable local default.
const root = resolve(process.argv[2] || 'ship');
const skipDirs = new Set(['.claude', 'C', 'dp-edit-distance-video']);

function readSlides(file) {
  const app = readFileSync(file, 'utf8');
  const match = app.match(/^const slides=(\[[\s\S]*?\]);\nconst stage=/);
  if (!match) return null;
  const cssFile = file.replace(/app\.js$/, 'styles.css');
  const htmlFile = file.replace(/app\.js$/, 'index.html');
  const css = existsSync(cssFile) ? readFileSync(cssFile, 'utf8') : '';
  const html = existsSync(htmlFile) ? readFileSync(htmlFile, 'utf8') : '';
  return { app, css, html, slides: JSON.parse(match[1]) };
}

function textOf(slide) {
  return [
    slide.eyebrow,
    slide.title,
    slide.caption,
    ...(slide.cards || []).flatMap((card) => [card.label, card.value]),
    ...(slide.items || []),
  ].filter(Boolean).join(' ');
}

function hasProcessWords(text) {
  return /先|再|然后|最后|当前|左边|右边|从|到|如果|否则|因为|所以|更新|记录|匹配|比较|标记|弹出|入栈|出栈|递归|回溯|窗口|指针|队列|栈|乘积|路径|边界|检查|枚举|遍历|表示|执行|抵消|收缩|松弛|推导|推出|扩展|计数|相加|相乘|维护|返回|转成|凑|取|最大|空节点/.test(text);
}

function needsProcessLanguage(slide) {
  return new Set(['sample', 'direct', 'pattern', 'walk', 'edge', 'codeFocus']).has(slide.visual);
}

function parseShapes(text) {
  return [...text.matchAll(/\b(matrix|grid|board)=([0-9]+)x([0-9]+)/g)].map((m) => ({
    type: m[1],
    rows: Number(m[2]),
    cols: Number(m[3]),
    raw: m[0],
  }));
}

function normalizeCodeShape(code = '') {
  return String(code)
    .split('\n')
    .map((line) => line.replace(/#.*$/, ''))
    .filter((line) => line.trim())
    .join('\n')
    .replace(/:\s*Optional\[[^\]]+\]/g, '')
    .replace(/:\s*List\[[^\]]+\]/g, '')
    .replace(/:\s*(int|str|bool|float)\b/g, '')
    .replace(/\)\s*->\s*[^:]+:/g, '):')
    .replace(/\s+/g, '');
}

function checkPage(slug, app, css, html, slides) {
  const issues = [];
  if (slides.length < 8) {
    issues.push({ step: 0, reason: 'segments-too-few', evidence: `${slides.length} steps` });
  }
  if (!/\.stage\{[^}]*transform:translate\(-50%,-50%\) scale\(/.test(css)) {
    issues.push({ step: 0, reason: 'stage-css-fallback-missing', evidence: 'stage has no centered transform fallback before JS fit() runs' });
  }
  if (!/benchmark-v3-20260605/.test(html)) {
    issues.push({ step: 0, reason: 'asset-version-not-refreshed', evidence: 'page may still be using cached benchmark-v2 assets' });
  }

  slides.forEach((slide, index) => {
    const step = index + 1;
    const text = textOf(slide);
    if (text.length < 24) {
      issues.push({ step, reason: 'too-short', evidence: slide.title || slide.caption || '' });
    }
    if (/当前 PDF|没有匹配|先承认|Python3\.9|Python3|人机|模板/.test(text)) {
      issues.push({ step, reason: 'forbidden-or-debug-word', evidence: text.slice(0, 160) });
    }
    if (/本题关键是核心关系|返回题目要求的结果|返回一个数量|返回最优值|返回树相关/.test(text)) {
      issues.push({ step, reason: 'generic-template-text', evidence: text.slice(0, 160) });
    }
    if (needsProcessLanguage(slide) && !hasProcessWords(text)) {
      issues.push({ step, reason: 'no-process-language', evidence: text.slice(0, 160) });
    }
    if ((slide.cards || []).some((card) => String(card.value || '').length > 95)) {
      issues.push({ step, reason: 'card-too-long', evidence: JSON.stringify(slide.cards).slice(0, 180) });
    }
  });

  const seenCode = new Map();
  slides.forEach((slide, index) => {
    if (slide.visual !== 'code') return;
    const shape = normalizeCodeShape(slide.code || '');
    if (!shape) return;
    if (seenCode.has(shape)) {
      issues.push({
        step: index + 1,
        reason: 'duplicate-code-slide',
        evidence: `${seenCode.get(shape)} == ${slide.title}`,
      });
    } else {
      seenCode.set(shape, slide.title || `step ${index + 1}`);
    }
  });

  for (let index = 1; index < slides.length; index += 1) {
    const prev = slides[index - 1];
    const curr = slides[index];
    if (prev.visual !== 'code' && curr.visual !== 'code' && prev.title === curr.title) {
      issues.push({ step: index + 1, reason: 'adjacent-same-title', evidence: curr.title || '' });
    }
  }

  slides.forEach((slide, index) => {
    if (slide.visual !== 'benchmark' || !slide.scene) return;
    const escaped = String(slide.scene).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!new RegExp(`sc==='${escaped}'`).test(app)) {
      issues.push({
        step: index + 1,
        reason: 'benchmark-scene-has-no-specific-diagram',
        evidence: slide.scene,
      });
    }
  });

  const sample = slides.find((slide) => slide.visual === 'sample' || /sample/.test(slide.scene || slide.kind || '')) || slides[2];
  if (sample) {
    const sampleText = textOf(sample);
    if (!/输入|输出|期望|检查|例子|样例|当前|左边|右边|路径|边界|公式|返回/.test(sampleText)) {
      issues.push({ step: 3, reason: 'sample-lacks-io-or-check', evidence: sampleText.slice(0, 180) });
    }
    if (!hasProcessWords(sampleText)) {
      issues.push({ step: 3, reason: 'sample-lacks-process', evidence: sampleText.slice(0, 180) });
    }
    for (const shape of parseShapes(sampleText)) {
      const smallGridCalls = [...app.matchAll(/smallGrid\(\[([^\]]*)\],\[[^\]]*\],([0-9]+)\)/g)];
      const shapeLikelyCovered = smallGridCalls.some((m) => {
        const cells = [...m[1].matchAll(/'[^']*'/g)].length;
        const cols = Number(m[2]);
        return cells === shape.rows * shape.cols && cols === shape.cols;
      });
      if (!shapeLikelyCovered && /matrix|grid|board/.test(shape.raw)) {
        issues.push({ step: 3, reason: 'shape-not-found-in-diagram', evidence: `${shape.raw}, kind=${sample.kind}` });
      }
    }
  }

  if (!/function diagram\(kind\)\{const override=overrideDiagram/.test(app)) {
    issues.push({ step: 0, reason: 'override-chain-missing', evidence: 'diagram() does not call overrideDiagram first' });
  }
  if (!/top-layout/.test(app)) {
    issues.push({ step: 0, reason: 'top-layout-missing', evidence: 'render() does not use top-layout' });
  }
  if (/function benchmarkDiagram(?:V2|V3)?\(s\)/.test(app)) {
    issues.push({ step: 0, reason: 'old-prefix-diagram-leftover', evidence: 'legacy benchmarkDiagram/V2/V3 function still exists' });
  }
  if (/sampleKinds\.has\(s\.kind\)[\s\S]{0,120}mode==='direct'|mode==='direct'[\s\S]{0,120}sampleKinds\.has\(s\.kind\)/.test(app)) {
    issues.push({ step: 0, reason: 'stage-reuses-sample-diagram', evidence: 'direct/bottleneck/pattern/walk can reuse diagram(kind)' });
  }
  return issues.map((issue) => ({ slug, ...issue }));
}

const allIssues = [];
let pageCount = 0;

for (const dirent of readdirSync(root, { withFileTypes: true })) {
  if (!dirent.isDirectory() || skipDirs.has(dirent.name)) continue;
  const appFile = join(root, dirent.name, 'presentation', 'app.js');
  if (!existsSync(appFile)) continue;
  pageCount += 1;
  try {
    execFileSync('node', ['--check', appFile], { stdio: 'pipe' });
  } catch (error) {
    const evidence = String(error.stderr || error.stdout || error.message).slice(0, 800);
    allIssues.push({ slug: dirent.name, step: 0, reason: 'app-js-syntax-error', evidence });
    continue;
  }
  const parsed = readSlides(appFile);
  if (!parsed) {
    allIssues.push({ slug: dirent.name, step: 0, reason: 'slides-parse-failed', evidence: appFile });
    continue;
  }
  allIssues.push(...checkPage(dirent.name, parsed.app, parsed.css, parsed.html, parsed.slides));
}

const grouped = allIssues.reduce((acc, issue) => {
  acc[issue.reason] = (acc[issue.reason] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({
  pageCount,
  issueCount: allIssues.length,
  grouped,
  issues: allIssues.slice(0, 120),
}, null, 2));
