import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const DEFAULT_TARGET_ROOT = 'C:\\Users\\11873\\Desktop\\ship';

function parseProblems(source) {
  const marker = 'export const problems: Problem[] = ';
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error('Cannot find Hot100 problem export.');
  }

  const start = source.indexOf('[', markerIndex + marker.length);
  const end = source.lastIndexOf('];');
  if (start < 0 || end < 0) {
    throw new Error('Cannot locate Hot100 problem array.');
  }

  return JSON.parse(source.slice(start, end + 1));
}

function stripCodeCommentPrefix(text = '') {
  return String(text)
    .replace(/^#\s*核心思路：/gm, '')
    .replace(/^#\s*手撕重点：/gm, '')
    .trim();
}

function clampText(text = '', limit = 210) {
  const cleaned = String(text).replace(/\s+/g, ' ').trim();
  if (cleaned.length <= limit) return cleaned;
  return `${cleaned.slice(0, limit)}...`;
}

function markdownEscape(text = '') {
  return String(text).replace(/\r\n/g, '\n');
}

function getDifficultyKey(difficulty = '') {
  if (difficulty.includes('简单')) return 'easy';
  if (difficulty.includes('困难')) return 'hard';
  return 'medium';
}

function getMode(category = '') {
  if (category.includes('动态规划')) return 'dp';
  if (category.includes('栈')) return 'stack';
  if (category.includes('双指针') || category.includes('滑动窗口')) return 'pointer';
  if (category.includes('二叉树')) return 'tree';
  if (category.includes('图')) return 'graph';
  if (category.includes('回溯')) return 'backtrack';
  if (category.includes('哈希')) return 'hash';
  return 'flow';
}

function getSteps(problem) {
  const difficulty = getDifficultyKey(problem.difficulty);
  const coreIdea = stripCodeCommentPrefix(problem.solutionCode.split('\n').find((line) => line.startsWith('# 核心思路')) || problem.whyThisPattern);
  const flow = problem.pseudocode?.includes('参考 level6') ? problem.hints.level5 : problem.pseudocode;
  const commonMistakes = Array.isArray(problem.commonMistakes) ? problem.commonMistakes : [];

  if (difficulty === 'easy') {
    return [
      {
        label: '读题确认',
        title: '先把题目翻译成一句人话',
        narrator: `我们先慢慢看题：${problem.title}要解决的核心是，${clampText(problem.summary, 140)}。先确认输入输出，后面才不会写偏。`,
        focus: problem.hints.level1,
      },
      {
        label: '直接抓手',
        title: '用最自然的思路站住脚',
        narrator: `这是一道基础题，先别急着找花哨技巧。最自然的做法通常已经很接近答案：${clampText(problem.bruteForceIdea || problem.hints.level3, 150)}`,
        focus: problem.bruteForceIdea || problem.hints.level3,
      },
      {
        label: '边界提醒',
        title: '提前照顾容易漏掉的情况',
        narrator: `简单题最常见的丢分点不是思路，而是边界。我们把容易错的地方先放到台面上。`,
        focus: commonMistakes.join('\n') || problem.hints.level2,
      },
      {
        label: '模式归纳',
        title: `为什么它归到 ${problem.category}`,
        narrator: `下一次遇到类似结构，可以从这里迁移：${clampText(problem.whyThisPattern, 160)}`,
        focus: coreIdea || problem.optimizedIdea,
      },
      {
        label: 'Python3.9',
        title: '把流程落成代码',
        narrator: `最后看 Python3.9 参考实现。读代码时盯住变量含义和更新顺序，不要只背形状。`,
        focus: flow,
        code: problem.solutionCode,
      },
    ];
  }

  if (difficulty === 'hard') {
    return [
      {
        label: '拆题',
        title: '先判断难点到底藏在哪里',
        narrator: `困难题先不写代码。我们先把目标、状态和边界拆开：${clampText(problem.summary, 150)}`,
        focus: problem.hints.level1,
      },
      {
        label: '不可行方案',
        title: '用暴力看清复杂度为什么会炸',
        narrator: `暴力思路不是废话，它告诉我们瓶颈在哪里：${clampText(problem.bruteForceIdea || problem.hints.level3, 160)}`,
        focus: problem.bruteForceIdea || problem.hints.level3,
      },
      {
        label: '关键结构',
        title: '找到能保存中间信息的结构',
        narrator: `真正的突破是把重复工作压下来。这题的关键结构是：${clampText(problem.whyThisPattern, 170)}`,
        focus: `${problem.hints.level2}\n\n${problem.whyThisPattern}`,
      },
      {
        label: '规则落地',
        title: `${problem.category} 的状态或不变量`,
        narrator: `现在把规则写清楚。只要每一步都维护这个状态，代码就不会散。`,
        focus: `${problem.hints.level4}\n\n${problem.optimizedIdea}`,
      },
      {
        label: '小样例推演',
        title: '用边界样例验证更新顺序',
        narrator: `困难题一定要手推一遍小样例。尤其检查初始化、循环方向、重复元素和极值输入。`,
        focus: `${flow}\n\n常见坑：\n${commonMistakes.join('\n')}`,
      },
      {
        label: 'Python3.9',
        title: '逐行对应状态和边界',
        narrator: `最后进入 Python3.9 参考代码。我们读的是不变量，不是死记模板。`,
        focus: coreIdea || problem.optimizedIdea,
        code: problem.solutionCode,
      },
    ];
  }

  return [
    {
      label: '建模',
      title: '把题意转成可执行目标',
      narrator: `先把题目翻译成人话：${clampText(problem.summary, 150)}。这一步做清楚，后面的优化才有方向。`,
      focus: `${problem.hints.level1}\n\n核心抓手：${coreIdea}`,
    },
    {
      label: '暴力起步',
      title: '先得到一定正确的方案',
      narrator: `中等题通常要从暴力走到优化。先看最直接的正确方案：${clampText(problem.bruteForceIdea || problem.hints.level3, 160)}`,
      focus: problem.bruteForceIdea || problem.hints.level3,
    },
    {
      label: '瓶颈',
      title: '找到重复计算或重复查找',
      narrator: `接下来找瓶颈。只要知道慢在哪里，就能知道该保存什么、跳过什么、或者提前剪掉什么。`,
      focus: `${problem.hints.level2}\n\n${problem.whyThisPattern}`,
    },
    {
      label: '优化',
      title: `${problem.category} 视角下的优化`,
      narrator: `现在切到${problem.category}视角。注意这里不是套模板，而是让结构替我们省掉重复工作。`,
      focus: `${problem.hints.level4}\n\n${problem.optimizedIdea}`,
    },
    {
      label: '流程',
      title: '先写流程，再写代码',
      narrator: `写代码前先排流程：变量是什么、循环怎么走、什么时候更新答案、什么时候返回。`,
      focus: flow,
    },
    {
      label: 'Python3.9',
      title: '参考实现与复盘',
      narrator: `最后看 Python3.9 参考实现。重点对照前面的流程，确认每一行都能解释清楚。`,
      focus: coreIdea || problem.optimizedIdea,
      code: problem.solutionCode,
    },
  ];
}

function createArticle(problem) {
  return markdownEscape(`# ${problem.title} / LeetCode ${problem.leetcodeId}

- 英文题名：${problem.titleEn}
- 难度：${problem.difficulty}
- 题型：${problem.category}
- 标签：${problem.tags.join('、')}

## 题目理解

${problem.summary}

## 学习目标

${problem.learningGoal}

## 核心模式

${problem.whyThisPattern}

## 暴力思路

${problem.bruteForceIdea}

## 优化思路

${problem.optimizedIdea}
`);
}

function createOutline(problem, steps) {
  return markdownEscape(`# ${problem.title} 解析动画 Outline

画幅：16:9 横屏网页成片

口播语气：甜美女声，清楚、温柔、有陪伴感，不读成机械说明书。

开发模式：每次点击推进一个讲解节拍；一屏只讲一个重点。

${steps.map((step, index) => `## ${index + 1}. ${step.label}：${step.title}

- 画面信息：${step.focus}
- 口播节拍：${step.narrator}
`).join('\n')}
`);
}

function createScript(problem, steps) {
  return markdownEscape(`# ${problem.title} 口播稿

> 声音设定：甜美女声，语气自然、有耐心，像认真带同学做题，不要机器人播报感。

${steps.map((step, index) => `## ${String(index + 1).padStart(2, '0')} ${step.label}

${step.narrator}
`).join('\n')}
`);
}

function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

function createHtml(problem, steps) {
  const payload = jsonForHtml({
    problem: {
      id: problem.id,
      leetcodeId: problem.leetcodeId,
      title: problem.title,
      titleEn: problem.titleEn,
      difficulty: problem.difficulty,
      category: problem.category,
      tags: problem.tags,
      slug: problem.slug,
      mode: getMode(problem.category),
    },
    steps: steps.map((step) => ({
      label: step.label,
      title: step.title,
      narrator: step.narrator,
      focus: step.focus,
      code: step.code || '',
    })),
  });

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${problem.title} 解析动画</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #07111f;
      --panel: rgba(15, 23, 42, 0.84);
      --line: rgba(148, 163, 184, 0.18);
      --text: #e8f2ff;
      --muted: #9eb3cc;
      --cyan: #38d5ff;
      --blue: #5b8dff;
      --mint: #2dd4bf;
      --rose: #fb7185;
      --amber: #fbbf24;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      overflow: hidden;
      background:
        linear-gradient(90deg, var(--line) 1px, transparent 1px) 0 0 / 7.5vw 7.5vw,
        linear-gradient(0deg, var(--line) 1px, transparent 1px) 0 0 / 7.5vw 7.5vw,
        radial-gradient(circle at 80% 20%, rgba(45, 212, 191, 0.16), transparent 30%),
        linear-gradient(135deg, #07111f 0%, #0f172a 60%, #06251f 100%);
      color: var(--text);
      font-family: Inter, "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
    }
    button { font: inherit; }
    .stage {
      width: 100vw;
      height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: clamp(24px, 3vw, 48px);
      gap: 18px;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      color: var(--muted);
      font-weight: 800;
      letter-spacing: 0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 34px;
      padding: 0 14px;
      border: 1px solid rgba(56, 213, 255, 0.28);
      background: rgba(56, 213, 255, 0.09);
      color: #b8edff;
      font-size: 13px;
      border-radius: 999px;
      white-space: nowrap;
    }
    .main {
      min-height: 0;
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.72fr);
      gap: clamp(22px, 3vw, 44px);
      align-items: stretch;
    }
    .copy {
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 24px;
    }
    .eyebrow {
      color: var(--cyan);
      font-size: clamp(13px, 1.1vw, 16px);
      font-weight: 900;
      text-transform: uppercase;
    }
    h1 {
      margin: 0;
      max-width: 12em;
      font-size: clamp(44px, 5.3vw, 84px);
      line-height: 0.98;
      letter-spacing: 0;
    }
    .subtitle {
      margin: 0;
      color: #b8c8dc;
      font-size: clamp(17px, 1.45vw, 24px);
      line-height: 1.7;
      max-width: 760px;
    }
    .narrator {
      border-left: 4px solid var(--cyan);
      background: rgba(8, 18, 33, 0.72);
      padding: 20px 24px;
      color: #dff6ff;
      font-size: clamp(17px, 1.28vw, 22px);
      line-height: 1.8;
      box-shadow: 0 18px 80px rgba(0, 0, 0, 0.3);
    }
    .focus {
      display: grid;
      gap: 12px;
      border: 1px solid rgba(148, 163, 184, 0.22);
      background: rgba(15, 23, 42, 0.72);
      padding: 22px;
      border-radius: 18px;
      font-size: clamp(15px, 1.1vw, 18px);
      line-height: 1.72;
      color: #cbd8ea;
      white-space: pre-wrap;
    }
    .visual {
      position: relative;
      overflow: hidden;
      display: grid;
      place-items: center;
      border: 1px solid rgba(148, 163, 184, 0.24);
      background: rgba(2, 6, 23, 0.46);
      border-radius: 22px;
      padding: clamp(24px, 3vw, 40px);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03), 0 24px 90px rgba(0,0,0,0.35);
    }
    .visual-grid {
      width: min(100%, 620px);
      display: grid;
      gap: 14px;
    }
    .node-row, .array-row, .stack-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .cell, .node, .stack-cell {
      min-width: 68px;
      min-height: 58px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      border: 1px solid rgba(56, 213, 255, 0.25);
      background: rgba(15, 23, 42, 0.82);
      color: #ecfeff;
      font-weight: 900;
      transition: transform .35s ease, background .35s ease, border-color .35s ease;
    }
    .cell.hot, .node.hot, .stack-cell.hot {
      transform: translateY(-8px);
      border-color: rgba(45, 212, 191, 0.75);
      background: rgba(20, 184, 166, 0.25);
    }
    .dp-table {
      width: min(100%, 520px);
      display: grid;
      grid-template-columns: repeat(5, minmax(54px, 1fr));
      gap: 8px;
    }
    .dp-table .cell {
      min-width: 0;
      min-height: 54px;
    }
    .flow-card {
      border: 1px solid rgba(251, 191, 36, 0.35);
      background: rgba(251, 191, 36, 0.1);
      padding: 18px;
      border-radius: 18px;
      color: #fde68a;
      font-weight: 900;
      text-align: center;
    }
    pre {
      width: 100%;
      max-height: 46vh;
      overflow: auto;
      margin: 0;
      border: 1px solid rgba(56, 213, 255, 0.18);
      border-radius: 16px;
      background: rgba(2, 6, 23, 0.84);
      padding: 18px;
      color: #d1fae5;
      font-size: clamp(12px, 0.9vw, 15px);
      line-height: 1.55;
    }
    .code-title {
      color: var(--mint);
      font-weight: 900;
      margin-bottom: 10px;
    }
    .controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
    }
    .dots {
      display: flex;
      align-items: center;
      gap: 9px;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: rgba(148, 163, 184, 0.38);
    }
    .dot.active {
      width: 44px;
      background: var(--cyan);
      box-shadow: 0 0 22px rgba(56, 213, 255, 0.52);
    }
    .nav {
      display: flex;
      gap: 10px;
    }
    .nav button {
      min-width: 98px;
      border: 1px solid rgba(56, 213, 255, 0.32);
      background: rgba(56, 213, 255, 0.1);
      color: #dff6ff;
      border-radius: 999px;
      padding: 11px 18px;
      cursor: pointer;
      font-weight: 900;
    }
    .nav button:hover { background: rgba(56, 213, 255, 0.18); }
    .step-in { animation: rise .46s ease both; }
    @keyframes rise {
      from { opacity: 0; transform: translateY(18px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="stage" id="stage">
    <header class="top">
      <div class="brand">
        <span class="badge" id="difficulty"></span>
        <span id="chapter"></span>
      </div>
      <span class="badge">Python3.9</span>
    </header>
    <main class="main">
      <section class="copy step-in" id="copy"></section>
      <aside class="visual step-in" id="visual"></aside>
    </main>
    <footer class="controls">
      <div class="dots" id="dots"></div>
      <nav class="nav">
        <button type="button" id="prev">上一幕</button>
        <button type="button" id="next">下一幕</button>
      </nav>
    </footer>
  </div>
  <script>
    const VIDEO_DATA = ${payload};
    let current = 0;

    const copy = document.getElementById('copy');
    const visual = document.getElementById('visual');
    const dots = document.getElementById('dots');
    const difficulty = document.getElementById('difficulty');
    const chapter = document.getElementById('chapter');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    const stage = document.getElementById('stage');

    difficulty.textContent = VIDEO_DATA.problem.difficulty;
    chapter.textContent = 'Hot100 / LeetCode #' + VIDEO_DATA.problem.leetcodeId + ' / ' + VIDEO_DATA.problem.category;

    function escapeHtml(text) {
      return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function makeVisual(mode, index, step) {
      if (step.code) {
        return '<div class="visual-grid"><div class="code-title">Python3.9</div><pre>' + escapeHtml(step.code) + '</pre></div>';
      }

      if (mode === 'dp') {
        const cells = Array.from({ length: 20 }, (_, i) => '<div class="cell ' + (i <= index * 3 ? 'hot' : '') + '">' + (i % 5 === 0 ? 'base' : 'dp') + '</div>').join('');
        return '<div class="visual-grid"><div class="dp-table">' + cells + '</div><div class="flow-card">状态 → 转移 → 初始化 → 遍历 → 推导</div></div>';
      }

      if (mode === 'stack') {
        const cells = ['栈底', '待匹配', '当前', '弹出', '答案'].map((item, i) => '<div class="stack-cell ' + (i <= index % 5 ? 'hot' : '') + '">' + item + '</div>').join('');
        return '<div class="visual-grid"><div class="stack-row">' + cells + '</div><div class="flow-card">只处理当前元素和栈顶关系</div></div>';
      }

      if (mode === 'pointer') {
        const cells = ['left', 'i', 'window', 'right', 'ans'].map((item, i) => '<div class="cell ' + (i === index % 5 || i === (index + 2) % 5 ? 'hot' : '') + '">' + item + '</div>').join('');
        return '<div class="visual-grid"><div class="array-row">' + cells + '</div><div class="flow-card">指针移动一次，信息就更新一次</div></div>';
      }

      if (mode === 'tree') {
        return '<div class="visual-grid"><div class="node-row"><div class="node hot">root</div></div><div class="node-row"><div class="node">left</div><div class="node">right</div></div><div class="node-row"><div class="node ' + (index > 2 ? 'hot' : '') + '">return</div></div><div class="flow-card">递归：当前节点只向左右子树要信息</div></div>';
      }

      if (mode === 'graph') {
        return '<div class="visual-grid"><div class="node-row"><div class="node hot">A</div><div class="node">B</div><div class="node hot">C</div></div><div class="node-row"><div class="node">visited</div><div class="node">queue</div><div class="node">path</div></div><div class="flow-card">节点、边、访问状态分开看</div></div>';
      }

      if (mode === 'backtrack') {
        return '<div class="visual-grid"><div class="node-row"><div class="node hot">选择</div></div><div class="node-row"><div class="node">递归</div><div class="node hot">撤销</div></div><div class="node-row"><div class="node">剪枝</div><div class="node">收集</div></div><div class="flow-card">一层只处理一个选择位</div></div>';
      }

      if (mode === 'hash') {
        const cells = ['key', 'value', 'need', 'seen', 'answer'].map((item, i) => '<div class="cell ' + (i <= index % 5 ? 'hot' : '') + '">' + item + '</div>').join('');
        return '<div class="visual-grid"><div class="array-row">' + cells + '</div><div class="flow-card">用记录换掉重复查找</div></div>';
      }

      return '<div class="visual-grid"><div class="flow-card">' + escapeHtml(step.label) + '</div><div class="flow-card">读题 → 暴力 → 瓶颈 → 优化 → 代码</div></div>';
    }

    function render() {
      const step = VIDEO_DATA.steps[current];
      copy.classList.remove('step-in');
      visual.classList.remove('step-in');
      void copy.offsetWidth;
      copy.classList.add('step-in');
      visual.classList.add('step-in');

      copy.innerHTML = [
        '<div class="eyebrow">' + escapeHtml(step.label) + ' / ' + (current + 1) + ' of ' + VIDEO_DATA.steps.length + '</div>',
        '<h1>' + escapeHtml(step.title) + '</h1>',
        '<p class="subtitle">' + escapeHtml(VIDEO_DATA.problem.title) + ' / ' + escapeHtml(VIDEO_DATA.problem.titleEn) + '</p>',
        '<div class="narrator">' + escapeHtml(step.narrator) + '</div>',
        '<div class="focus">' + escapeHtml(step.focus) + '</div>'
      ].join('');

      visual.innerHTML = makeVisual(VIDEO_DATA.problem.mode, current, step);
      dots.innerHTML = VIDEO_DATA.steps.map((_, index) => '<span class="dot ' + (index === current ? 'active' : '') + '"></span>').join('');
      prev.disabled = current === 0;
      next.disabled = current === VIDEO_DATA.steps.length - 1;
    }

    function move(delta) {
      current = Math.max(0, Math.min(VIDEO_DATA.steps.length - 1, current + delta));
      render();
    }

    prev.addEventListener('click', (event) => { event.stopPropagation(); move(-1); });
    next.addEventListener('click', (event) => { event.stopPropagation(); move(1); });
    stage.addEventListener('click', () => move(1));
    window.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === ' ') move(1);
      if (event.key === 'ArrowLeft') move(-1);
    });

    render();
  </script>
</body>
</html>`;
}

async function main() {
  const targetRoot = resolve(process.argv[2] || DEFAULT_TARGET_ROOT);
  const source = await readFile('src/data/problems.ts', 'utf8');
  const problems = parseProblems(source);
  const manifest = [];

  for (const problem of problems) {
    const steps = getSteps(problem);
    const root = join(targetRoot, problem.slug);
    const presentation = join(root, 'presentation');

    await mkdir(presentation, { recursive: true });
    await writeFile(join(root, 'article.md'), createArticle(problem), 'utf8');
    await writeFile(join(root, 'outline.md'), createOutline(problem, steps), 'utf8');
    await writeFile(join(root, 'script.md'), createScript(problem, steps), 'utf8');
    await writeFile(join(root, '.generated-hot100'), 'generated by scripts/generate_hot100_videos.mjs\n', 'utf8');
    await writeFile(join(presentation, 'index.html'), createHtml(problem, steps), 'utf8');

    manifest.push({
      id: problem.id,
      leetcodeId: problem.leetcodeId,
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      path: join(root, 'presentation', 'index.html'),
    });
  }

  await writeFile(join(targetRoot, 'hot100-video-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Generated ${manifest.length} Hot100 web video presentations in ${targetRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
