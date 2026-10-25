import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const DEFAULT_TARGET_ROOT = 'C:\\Users\\11873\\Desktop\\ship';
const CASE_TTS = 'C:\\Users\\11873\\Desktop\\ship\\dp-edit-distance-video\\scripts\\tts-mimo.py';

function extractJsonArray(source, marker) {
  const markerIndex = source.indexOf(marker);
  const start = source.indexOf('[', markerIndex + marker.length);
  const end = source.lastIndexOf('];');
  return JSON.parse(source.slice(start, end + 1));
}

function extractJsonObject(source, marker) {
  const markerIndex = source.indexOf(marker);
  const start = source.indexOf('{', markerIndex + marker.length);
  const end = source.indexOf('\n};', start);
  return JSON.parse(source.slice(start, end + 2));
}

function clean(text = '') {
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function compact(text = '', limit = 260) {
  const value = clean(text).replace(/\s+/g, ' ');
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}...`;
}

function codePreview(code = '', maxLines = 22) {
  return clean(code).split('\n').slice(0, maxLines).join('\n');
}

function difficultyTone(difficulty = '') {
  if (difficulty.includes('困难')) return '这题难度高，我们慢慢拆，不靠背模板硬顶。';
  if (difficulty.includes('简单')) return '这题是基础题，但基础题也要把边界讲清楚。';
  return '这题是中等题，重点是从暴力瓶颈走到稳定写法。';
}

function frameworkFor(problem) {
  const category = problem.category || '';
  if (category.includes('动态规划')) {
    return {
      name: '动态规划五部曲',
      steps: ['定 dp 含义', '写递推公式', '初始化', '确定遍历顺序', '举例推导'],
      visual: 'dp',
      script: '我们按代码随想录的动态规划五部曲来讲：先定状态，再写转移，接着处理初始化和遍历顺序，最后用例子把表推出来。',
    };
  }
  if (category.includes('二叉树')) {
    return {
      name: '二叉树递归三部曲',
      steps: ['确定递归函数', '确定终止条件', '确定单层逻辑', '返回值复盘'],
      visual: 'tree',
      script: '二叉树题按递归三部曲来讲：函数要返回什么，什么时候停，当前节点这一层到底做什么。',
    };
  }
  if (category.includes('回溯')) {
    return {
      name: '回溯三件套',
      steps: ['抽象成树', '横向枚举选择', '纵向递归深入', '撤销选择和剪枝'],
      visual: 'backtrack',
      script: '回溯题先画成一棵选择树：横向是同层选择，纵向是递归深入，离开节点时要撤销选择。',
    };
  }
  if (category.includes('贪心')) {
    return {
      name: '贪心证明路线',
      steps: ['局部最优', '排序或扫描策略', '反例检查', '推出全局最优'],
      visual: 'greedy',
      script: '贪心题不能只说感觉。我们要先说明局部最优是什么，再检查它为什么能推到全局最优。',
    };
  }
  if (category.includes('栈')) {
    return {
      name: '栈与单调结构',
      steps: ['栈里存什么', '什么时候入栈', '什么时候弹栈', '弹出时结算什么'],
      visual: 'stack',
      script: '栈题关键不是会不会 push 和 pop，而是说清楚栈里保存的未解决信息是什么。',
    };
  }
  if (category.includes('双指针') || category.includes('滑动窗口')) {
    return {
      name: '指针移动不变量',
      steps: ['窗口含义', '右端扩张', '左端收缩', '答案更新时机'],
      visual: 'pointer',
      script: '指针题要讲清楚不变量：窗口现在表示什么，什么时候扩张，什么时候收缩，答案在哪一刻更新。',
    };
  }
  if (category.includes('哈希')) {
    return {
      name: '哈希记录换查询',
      steps: ['记录什么', '何时查询', '何时写入', '如何避免自匹配'],
      visual: 'hash',
      script: '哈希题的本质是用记录换掉重复查找。重点是先查还是先存，以及 key 和 value 分别代表什么。',
    };
  }
  return {
    name: '代码随想录拆题流程',
    steps: ['读题建模', '暴力起步', '定位瓶颈', '落到代码'],
    visual: 'flow',
    script: '这题我们按代码随想录的拆题习惯来讲：先读题建模，再从暴力方案找到瓶颈，最后落到代码。',
  };
}

function buildSlides({ problem, refinement, source, variants = [] }) {
  const framework = frameworkFor(problem);
  const edge = refinement?.edgeCases?.[0];
  const pitfalls = refinement?.commonPitfalls?.length ? refinement.commonPitfalls : problem.commonMistakes;
  const checklist = refinement?.interviewChecklist?.length ? refinement.interviewChecklist : problem.reviewQuestions;
  const difficultyIntro = `难度：${problem.difficulty}\n题型：${problem.category}\n核心训练：${compact(problem.learningGoal, 120)}`;
  const sourceText = source
    ? `参考材料：代码随想录对应章节\n关键内容：${compact(source.snippet, 220)}`
    : difficultyIntro;
  const code = refinement?.annotatedCode || problem.solutionCode;
  const core = refinement?.coreIdea || problem.whyThisPattern;
  const variantSummary = variants.length
    ? variants.slice(0, 4).map((variant, index) => `${index + 1}. ${variant.name}：${variant.time}，${variant.space}。${compact(variant.idea, 72)}`).join('\n')
    : checklist.slice(0, 4).join('\n');

  return [
    {
      title: `${problem.title} / LeetCode ${problem.leetcodeId}`,
      eyebrow: '题目定位',
      voice: `${difficultyTone(problem.difficulty)}这一题的题型是${problem.category}，我们先看清输入输出和边界，再讲为什么可以优化。`,
      body: sourceText,
      visual: 'source',
    },
    {
      title: '先把题目翻译成人话',
      eyebrow: 'READ THE PROBLEM',
      voice: `先别急着写代码。${problem.title}要解决的是：${compact(problem.summary, 180)}`,
      body: `${problem.summary}\n\n学习目标：${problem.learningGoal}`,
      visual: 'problem',
    },
    {
      title: framework.name,
      eyebrow: '讲解框架',
      voice: framework.script,
      body: framework.steps.map((item, index) => `${index + 1}. ${item}`).join('\n'),
      visual: framework.visual,
    },
    {
      title: '核心抓手',
      eyebrow: 'CORE IDEA',
      voice: `这题真正要抓住的是：${compact(core, 180)} 只要这个点想通，代码就不会散。`,
      body: `${core}\n\n为什么是这个题型：${problem.whyThisPattern}`,
      visual: framework.visual,
    },
    {
      title: '从暴力走到优化',
      eyebrow: '暴力到优化',
      voice: `先把暴力方案完整走一遍，再看它慢在哪里。暴力会重复查找配对数，优化后我们用记录换查询。`,
      body: `暴力：${compact(problem.bruteForceIdea, 120)}\n\n瓶颈：重复查找或重复计算。\n\n优化：${compact(problem.optimizedIdea, 150)}`,
      visual: 'compare',
    },
    {
      title: edge ? '拿一个样例推一遍' : '手写流程',
      eyebrow: 'DERIVATION',
      voice: edge
        ? `现在用一个样例走一遍。输入是 ${edge.input}，期望结果是 ${edge.expected}。重点看它为什么能测出这题的关键边界。`
        : `现在把流程落成步骤。先写变量含义，再写循环或递归顺序，最后检查返回值。`,
      body: edge
        ? `输入：${edge.input}\n期望：${edge.expected}\n为什么测：${edge.why}\n\n手写步骤：\n${(refinement?.handwriteSteps || []).join('\n')}`
        : (refinement?.handwriteSteps || [problem.pseudocode]).join('\n'),
      visual: framework.visual,
    },
    {
      title: 'Python 代码',
      eyebrow: '代码走读',
      voice: '最后看 Python 代码。不要只看语法，重点对照变量含义、更新顺序和边界处理。',
      body: `看三处：\n1. 哈希表里存什么。\n2. 为什么先查再存。\n3. 找到答案后为什么可以直接返回。`,
      code,
      visual: 'code',
    },
    {
      title: '多解法和复盘',
      eyebrow: '复盘',
      voice: `最后补上多种写法的取舍。面试推荐哈希表，但暴力和排序双指针也要知道，它们能帮你解释为什么推荐解更好。`,
      body: `多解法对比：\n${variantSummary}\n\n常见坑：\n${pitfalls.slice(0, 3).join('\n')}`,
      visual: 'review',
    },
  ];
}

function createArticle(problem, source) {
  return clean(`# ${problem.title} / LeetCode ${problem.leetcodeId}

## PDF 来源

${source ? `《代码随想录》${source.pdf} 第 ${source.page} 页。\n\n${source.snippet}` : '本题使用 Hot100 精修数据，并按代码随想录同专题方法讲解。'}

## Hot100 题库材料

${problem.summary}

${problem.learningGoal}

${problem.whyThisPattern}
`);
}

function createScript(slides) {
  return clean(`# 口播稿

> 声音设定：甜美女声，像 B 站算法老师带同学一步步做题，自然、有耐心，不要机器人播报感。

${slides.map((slide, index) => `## ${String(index + 1).padStart(2, '0')} ${slide.title}\n\n${slide.voice}`).join('\n\n')}
`);
}

function createOutline(problem, slides, source) {
  return clean(`# ${problem.title} Web Video Presentation Outline

- 画幅：16:9
- 交互：点击 / 方向键推进，支持声音和自动播放
- 来源：${source ? `${source.pdf} 第 ${source.page} 页` : '无单题 PDF，使用同专题代码随想录流程'}

${slides.map((slide, index) => `## ${index + 1}. ${slide.title}\n\n- 信息：${slide.body}\n- 口播：${slide.voice}\n- 视觉类型：${slide.visual}`).join('\n\n')}
`);
}

function createAudioSegments(slug, slides) {
  return slides.map((slide, index) => ({
    chapter: slug,
    step: index + 1,
    text: slide.voice,
    audio: `${slug}/${index + 1}.wav`,
  }));
}

function jsonScript(value) {
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
}

function createIndex(problem) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${problem.title} 解析动画</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div class="viewport">
      <section id="stage" class="stage" aria-label="${problem.title} 解析动画">
        <div class="blueprint-grid"></div>
        <header class="hud">
          <div>
            <span class="eyebrow">HOT100 VIDEO</span>
            <strong>${problem.title} / LeetCode ${problem.leetcodeId}</strong>
          </div>
          <div class="step-counter">
            <span id="stepNow">01</span>
            <span>/</span>
            <span id="stepTotal">08</span>
          </div>
        </header>
        <main id="scene" class="scene"></main>
        <footer class="subtitle"><p id="narration"></p></footer>
        <div class="progress-shell" aria-hidden="true"><div id="progressBar" class="progress-bar"></div></div>
        <nav class="controls" aria-label="播放控制">
          <button id="prevBtn" type="button">上一幕</button>
          <button id="audioBtn" type="button">声音关闭</button>
          <button id="autoBtn" type="button">自动播放</button>
          <button id="nextBtn" type="button">下一幕</button>
        </nav>
      </section>
    </div>
    <script src="./app.js"></script>
  </body>
</html>`;
}

function createStyles() {
  return `:root{--bg:#081321;--panel:rgba(13,27,47,.82);--line:rgba(56,189,248,.22);--text:#eaf4ff;--muted:#9fb5d1;--cyan:#38d5ff;--mint:#2dd4bf;--amber:#fbbf24;--rose:#fb7185}*{box-sizing:border-box}body{margin:0;overflow:hidden;background:#06101d;color:var(--text);font-family:Inter,"Microsoft YaHei","PingFang SC",system-ui,sans-serif}.viewport{width:100vw;height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 80% 12%,rgba(45,212,191,.16),transparent 32%),linear-gradient(135deg,#07111f,#0f172a 58%,#06251f)}.stage{position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform-origin:center;background:linear-gradient(90deg,rgba(56,189,248,.08) 1px,transparent 1px) 0 0/96px 96px,linear-gradient(0deg,rgba(56,189,248,.08) 1px,transparent 1px) 0 0/96px 96px,#081321;overflow:hidden}.blueprint-grid{position:absolute;inset:0;background:radial-gradient(circle at 70% 65%,rgba(45,212,191,.12),transparent 36%);pointer-events:none}.hud{position:absolute;left:58px;right:58px;top:44px;z-index:3;display:flex;justify-content:space-between;align-items:flex-start;color:#dceeff}.eyebrow{display:block;color:var(--cyan);font-size:20px;font-weight:900;letter-spacing:.08em}.hud strong{display:block;margin-top:9px;font-size:26px}.step-counter{border:1px solid rgba(56,213,255,.28);padding:12px 18px;font-size:22px;font-weight:900;background:rgba(8,18,33,.55)}.scene{position:absolute;left:58px;right:58px;top:142px;bottom:190px;z-index:2}.subtitle{position:absolute;left:58px;right:58px;bottom:86px;z-index:3;border-left:5px solid var(--cyan);background:rgba(2,8,23,.76);padding:18px 26px;min-height:76px;max-height:108px;overflow:hidden}.subtitle p{margin:0;font-size:24px;line-height:1.45;color:#e4f7ff}.progress-shell{position:absolute;left:58px;right:58px;bottom:72px;height:5px;background:rgba(148,163,184,.18);z-index:3}.progress-bar{height:100%;background:linear-gradient(90deg,var(--cyan),var(--mint));width:0}.controls{position:absolute;right:58px;top:102px;z-index:4;display:flex;gap:12px}.controls button{border:1px solid rgba(56,213,255,.35);background:rgba(8,18,33,.75);color:#e6f7ff;font-size:18px;font-weight:900;padding:12px 18px;cursor:pointer}.two-col{height:100%;display:grid;grid-template-columns:minmax(0,1fr) minmax(560px,.88fr);gap:44px;align-items:center}.stack{display:grid;gap:20px;align-content:center;min-width:0}.hero-title{margin:0;font-size:66px;line-height:1.08;letter-spacing:0;max-width:900px}.lead{margin:0;max-width:860px;color:#bad0ea;font-size:25px;line-height:1.58;max-height:126px;overflow:hidden}.panel{border:1px solid rgba(148,163,184,.24);background:rgba(15,23,42,.76);box-shadow:0 30px 90px rgba(0,0,0,.34);padding:30px;border-radius:6px;overflow:hidden}.panel h3{margin:0 0 20px;font-size:34px}.body-text{white-space:pre-wrap;color:#d7e7fa;font-size:22px;line-height:1.58;max-height:250px;overflow:hidden}.formula{white-space:pre-wrap;border:1px dashed rgba(56,213,255,.38);background:rgba(56,213,255,.08);padding:22px 26px;color:#dff8ff;font-size:24px;line-height:1.58}.checklist{display:grid;gap:14px}.check{display:flex;gap:16px;align-items:flex-start;padding:17px 20px;background:rgba(56,213,255,.08);border:1px solid rgba(56,213,255,.16)}.check b{display:grid;place-items:center;width:38px;height:38px;border-radius:999px;background:var(--cyan);color:#062033}.check p{margin:0;font-size:23px;line-height:1.4}.visual-board{min-height:470px;display:grid;place-items:center;gap:22px}.array-row,.node-row,.stack-row{display:flex;gap:18px;justify-content:center;flex-wrap:wrap}.cell,.node,.stack-cell{min-width:92px;min-height:72px;border:1px solid rgba(56,213,255,.3);background:rgba(15,23,42,.86);display:grid;place-items:center;font-size:25px;font-weight:900}.hot{background:rgba(45,212,191,.25);border-color:rgba(45,212,191,.8);transform:translateY(-8px)}.tree{display:grid;gap:26px;justify-items:center}.tree .level{display:flex;gap:34px}.code-panel{height:548px;overflow:auto;border:1px solid rgba(56,213,255,.25);background:rgba(2,6,23,.86);padding:24px;border-radius:6px}.code-panel pre{margin:0;color:#d1fae5;font-size:20px;line-height:1.45}.fade-in{animation:rise .36s ease both}@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`;
}

function createApp(problem, slides) {
  const data = { slug: problem.slug, title: problem.title, leetcodeId: problem.leetcodeId, slides };
  return `const DATA = ${jsonScript(data)};
const stage=document.getElementById('stage'),scene=document.getElementById('scene'),narration=document.getElementById('narration'),stepNow=document.getElementById('stepNow'),stepTotal=document.getElementById('stepTotal'),progressBar=document.getElementById('progressBar'),prevBtn=document.getElementById('prevBtn'),nextBtn=document.getElementById('nextBtn'),audioBtn=document.getElementById('audioBtn'),autoBtn=document.getElementById('autoBtn');
let step=0,audioMode='manual',audioTimer=null;const audio=new Audio();stepTotal.textContent=String(DATA.slides.length).padStart(2,'0');
function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;")}
function list(body){return String(body||'').split('\\n').filter(Boolean).slice(0,7).map((x,i)=>'<div class="check"><b>'+(i+1)+'</b><p>'+esc(x.replace(/^\\d+[.、]\\s*/,''))+'</p></div>').join('')}
function visual(kind,i){if(kind==='code')return '<div class="code-panel"><pre>'+esc(DATA.slides[i].code||DATA.slides[i].body)+'</pre></div>';if(kind==='dp')return '<div class="visual-board"><div class="array-row">'+['dp[i]','递推','初始化','遍历','推导'].map((x,k)=>'<div class="cell '+(k<=i%5?'hot':'')+'">'+x+'</div>').join('')+'</div><div class="formula">代码随想录动态规划五部曲：先定义状态，再验证转移。</div></div>';if(kind==='tree')return '<div class="visual-board tree"><div class="level"><div class="node hot">root</div></div><div class="level"><div class="node">left</div><div class="node">right</div></div><div class="level"><div class="node hot">返回值</div></div><div class="formula">递归三部曲：函数、终止、单层逻辑。</div></div>';if(kind==='backtrack')return '<div class="visual-board tree"><div class="level"><div class="node hot">path</div></div><div class="level"><div class="node">选择1</div><div class="node hot">选择2</div><div class="node">选择3</div></div><div class="formula">选择 → 递归 → 撤销，剪枝只剪不可能分支。</div></div>';if(kind==='stack')return '<div class="visual-board"><div class="stack-row">'+['栈底','未解决','当前','弹出','结算'].map((x,k)=>'<div class="stack-cell '+(k<=i%5?'hot':'')+'">'+x+'</div>').join('')+'</div><div class="formula">栈里只存还没被当前信息解决的位置。</div></div>';if(kind==='pointer')return '<div class="visual-board"><div class="array-row">'+['left','窗口','right','答案','边界'].map((x,k)=>'<div class="cell '+(k===i%5||k===(i+2)%5?'hot':'')+'">'+x+'</div>').join('')+'</div><div class="formula">指针每移动一次，都要维护窗口不变量。</div></div>';if(kind==='hash')return '<div class="visual-board"><div class="array-row">'+['key','value','need','seen','ans'].map((x,k)=>'<div class="cell '+(k<=i%5?'hot':'')+'">'+x+'</div>').join('')+'</div><div class="formula">用记录换查询，重点是先查还是先存。</div></div>';if(kind==='compare')return '<div class="visual-board"><div class="array-row"><div class="cell hot">暴力</div><div class="cell">瓶颈</div><div class="cell hot">优化</div></div><div class="formula">优化不是换模板，是消掉重复工作。</div></div>';return '<div class="visual-board"><div class="formula">'+esc(DATA.slides[i].body)+'</div></div>'}
function render(){const s=DATA.slides[step];stepNow.textContent=String(step+1).padStart(2,'0');progressBar.style.width=((step+1)/DATA.slides.length*100)+'%';narration.textContent=s.voice;scene.innerHTML='<div class="two-col fade-in"><div class="stack"><span class="eyebrow">'+esc(s.eyebrow)+'</span><h1 class="hero-title">'+esc(s.title)+'</h1><p class="lead">'+esc(s.voice)+'</p><div class="panel"><div class="body-text">'+esc(s.body)+'</div></div></div><div class="panel">'+visual(s.visual,step)+'</div></div>';document.title=s.title+' | '+DATA.title;playAudio()}
function audioSrc(){return './audio/'+DATA.slug+'/'+(step+1)+'.wav'}function estimateMs(t){return Math.max(3500,Math.min(12000,String(t||'').length*220))}
function clearTimer(){if(audioTimer){clearTimeout(audioTimer);audioTimer=null}}function stopAudio(){audio.pause();audio.removeAttribute('src');audio.load();clearTimer()}
function fallback(){clearTimer();if(audioMode==='auto')audioTimer=setTimeout(()=>{if(step<DATA.slides.length-1)go(1)},estimateMs(DATA.slides[step]?.voice))}
function playAudio(){stopAudio();if(audioMode==='manual')return;audio.src=audioSrc();audio.onended=()=>{clearTimer();if(audioMode==='auto')audioTimer=setTimeout(()=>{if(step<DATA.slides.length-1)go(1)},200)};audio.onerror=fallback;audio.play().catch(fallback)}
function refresh(){audioBtn.textContent=audioMode==='manual'?'声音关闭':'声音开启';autoBtn.textContent=audioMode==='auto'?'停止自动':'自动播放'}
function go(d){step=Math.max(0,Math.min(DATA.slides.length-1,step+d));render()}function stopAuto(){if(audioMode==='auto')audioMode='audio';stopAudio();refresh()}function toggleAudio(){if(audioMode==='manual'){audioMode='audio';refresh();playAudio()}else{audioMode='manual';stopAudio();refresh()}}function toggleAuto(){audioMode=audioMode==='auto'?'audio':'auto';refresh();playAudio()}
prevBtn.onclick=()=>{stopAuto();go(-1)};nextBtn.onclick=()=>{stopAuto();go(1)};audioBtn.onclick=toggleAudio;autoBtn.onclick=toggleAuto;stage.onclick=e=>{if(e.target.closest('button'))return;stopAuto();go(1)};window.onkeydown=e=>{if(e.key==='ArrowLeft'){stopAuto();go(-1)}if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();stopAuto();go(1)}if(e.key.toLowerCase()==='m')toggleAudio();if(e.key.toLowerCase()==='a')toggleAuto()};function fit(){stage.style.transform='translate(-50%,-50%) scale('+Math.min(innerWidth/1920,innerHeight/1080)+')'}addEventListener('resize',fit);fit();refresh();render();`;
}

async function main() {
  const targetRoot = resolve(process.argv[2] || DEFAULT_TARGET_ROOT);
  const slugArgIndex = process.argv.indexOf('--slug');
  const onlySlug = slugArgIndex >= 0 ? process.argv[slugArgIndex + 1] : null;
  const allProblems = extractJsonArray(await readFile('src/data/problems.ts', 'utf8'), 'export const problems: Problem[] = ');
  const problems = onlySlug ? allProblems.filter((problem) => problem.slug === onlySlug) : allProblems;
  const refinements = extractJsonObject(await readFile('src/data/problemRefinements.ts', 'utf8'), 'export const problemRefinements: Record<number, ProblemRefinement> = ');
  const solutionVariants = extractJsonObject(await readFile('src/data/solutionVariants.ts', 'utf8'), 'export const solutionVariants: Record<number, SolutionVariant[]> = ');
  const sources = JSON.parse(await readFile('scripts/hot100_pdf_sources.json', 'utf8'));
  const sourceBySlug = new Map(sources.map((item) => [item.slug, item.source]));
  const manifest = [];

  for (const problem of problems) {
    const source = sourceBySlug.get(problem.slug);
    const refinement = refinements[String(problem.leetcodeId)];
    const variants = solutionVariants[String(problem.leetcodeId)] || [];
    const slides = buildSlides({ problem, refinement, source, variants });
    const root = join(targetRoot, problem.slug);
    const presentation = join(root, 'presentation');
    const scriptsDir = join(root, 'scripts');
    await mkdir(presentation, { recursive: true });
    await mkdir(scriptsDir, { recursive: true });

    await writeFile(join(root, 'article.md'), createArticle(problem, source), 'utf8');
    await writeFile(join(root, 'script.md'), createScript(slides), 'utf8');
    await writeFile(join(root, 'outline.md'), createOutline(problem, slides, source), 'utf8');
    await writeFile(join(root, 'audio-segments.json'), JSON.stringify(createAudioSegments(problem.slug, slides), null, 2), 'utf8');
    await writeFile(join(root, '.generated-hot100'), 'generated by scripts/generate_hot100_pdf_videos.mjs\n', 'utf8');
    await writeFile(join(presentation, 'index.html'), createIndex(problem), 'utf8');
    await writeFile(join(presentation, 'styles.css'), createStyles(), 'utf8');
    await writeFile(join(presentation, 'app.js'), createApp(problem, slides), 'utf8');
    await copyFile(CASE_TTS, join(scriptsDir, 'tts-mimo.py')).catch(() => {});

    manifest.push({
      id: problem.id,
      leetcodeId: problem.leetcodeId,
      title: problem.title,
      slug: problem.slug,
      source: source ? `${source.pdf} p${source.page}` : null,
      segments: slides.length,
      path: join(presentation, 'index.html'),
    });
  }

  if (!onlySlug) {
    await writeFile(join(targetRoot, 'hot100-video-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  }
  console.log(`Generated ${manifest.length} PDF-aware Hot100 web videos in ${targetRoot}`);
  console.log(`Direct PDF sources: ${manifest.filter((item) => item.source).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
