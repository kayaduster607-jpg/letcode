import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PROJECT_DIR = 'C:\\Users\\11873\\Desktop\\ship\\two-sum';
const OUT_DIR = join(PROJECT_DIR, 'presentation');

const slides = [
  {
    eyebrow: '题目定位',
    title: '两数之和',
    caption: '简单题，但要讲清楚边界和查询顺序。',
    audio: 'two-sum/1.wav',
    type: 'intro',
  },
  {
    eyebrow: '读题建模',
    title: '找两个下标，不是找两个数',
    caption: 'nums 里找两个元素相加等于 target，返回它们的 index。',
    audio: 'two-sum/2.wav',
    type: 'problem',
  },
  {
    eyebrow: '暴力枚举',
    title: '先把所有配对扫出来',
    caption: '外层固定 i，内层从 i + 1 往后找 j，找到 nums[i] + nums[j] == target 就返回。',
    audio: 'two-sum/3.wav',
    type: 'bruteDemo',
  },
  {
    eyebrow: '瓶颈出现',
    title: '重复扫描可以被省掉',
    caption: '暴力每次都向后找另一个数；哈希表把“找另一个数”变成一次查询。',
    audio: 'two-sum/4.wav',
    type: 'compare',
  },
  {
    eyebrow: '哈希框架',
    title: '用记录换查询',
    caption: 'key 存数值，value 存下标；遍历到 x 时，只查 need = target - x。',
    audio: 'two-sum/5.wav',
    type: 'hashFrame',
  },
  {
    eyebrow: '核心过程',
    title: '先查 need，再存 x',
    caption: '当前 x 只问一件事：target - x 之前出现过没有。',
    audio: 'two-sum/6.wav',
    type: 'trace',
  },
  {
    eyebrow: '边界样例',
    title: '重复值：nums = [3, 3]',
    caption: '先查再存，避免把同一个元素配给自己。',
    audio: 'two-sum/7.wav',
    type: 'duplicate',
  },
  {
    eyebrow: '推荐代码',
    title: '哈希表写法',
    caption: '只看四行关键动作：建表、算 need、查表、存表。',
    audio: 'two-sum/8.wav',
    type: 'code',
  },
  {
    eyebrow: '备选代码',
    title: '暴力双循环写法',
    caption: '这份代码最直观：枚举 i，再枚举 i 后面的 j，命中就返回两个下标。',
    audio: 'two-sum/9.wav',
    type: 'bruteCode',
  },
  {
    eyebrow: '备选代码',
    title: '排序双指针写法',
    caption: '先把数值和原下标绑在一起排序，再用 left、right 夹逼，返回原始下标。',
    audio: 'two-sum/10.wav',
    type: 'sortCode',
  },
  {
    eyebrow: '多解法取舍',
    title: '三份代码怎么选',
    caption: '暴力用来理解枚举，哈希用于提交，排序双指针适合面试追问取舍。',
    audio: 'two-sum/11.wav',
    type: 'variants',
  },
];

const audioSegments = [
  '这题虽然是简单题，但真正要讲清楚的是边界和查询顺序。我们先确认它要返回的是两个下标，不只是两个数值。',
  '题目给 nums 和 target，要在数组里找两个不同位置，让它们的和等于 target。比如 nums 是二、七、十一、十五，target 是九，答案就是 index zero 和 index one。',
  '最自然的做法是暴力枚举。外层固定 i，内层从 i 加一开始往后扫 j，只要 nums[i] 加 nums[j] 等于 target，就返回 i 和 j。',
  '暴力能保证正确，但慢在重复扫描。每拿到一个新数字，都要重新向后找配对数。优化方向很明确：把“向后找”换成“查一下之前见过没有”。',
  '哈希表就是这个优化。key 存数字本身，value 存它第一次出现的下标。遍历到 x 时，我们算 need 等于 target 减 x，然后查 need 之前有没有出现过。',
  '用 nums 等于二、七、十一、十五来走一遍。先看二，need 是七，seen 里没有，就存二到零。再看七，need 是二，seen 里已经有二，所以直接返回零和一。',
  '重复值要特别注意。nums 是三、三，target 是六。第一个三先查不到，再存进去；第二个三再查，才能找到第一个三，避免把同一个元素配给自己。',
  '推荐写法就是哈希表。先建 seen，再在循环里算 need。如果 need 在 seen 里，返回 seen[need] 和当前 i；否则把当前 x 存进去，留给后面的元素匹配。',
  '暴力代码也要会讲。第一层 for 枚举 i，第二层 for 从 i 加一枚举 j。判断 nums[i] 加 nums[j] 是否等于 target，命中就返回 i 和 j。',
  '排序双指针是备选写法。先把每个数字和原下标绑成二元组排序，再让 left 和 right 从两端往中间走。sum 小了移动 left，大了移动 right，命中时返回原始下标。',
  '所以三份代码的定位很清楚：暴力用来解释问题，哈希表是这题的主答案，排序双指针用于追问空间取舍，但要注意排序后必须保留原下标。',
].map((text, index) => ({
  chapter: 'two-sum',
  step: index + 1,
  text,
}));

function indexHtml() {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>两数之和解析动画</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div class="viewport">
      <section id="stage" class="stage" aria-label="两数之和解析动画">
        <div class="grid-bg"></div>
        <header class="hud">
          <div>
            <span class="kicker">HOT100 VIDEO</span>
            <strong>两数之和 / LeetCode 1</strong>
          </div>
          <div class="step-counter"><span id="stepNow">01</span><span>/</span><span id="stepTotal">11</span></div>
        </header>
        <main id="scene" class="scene"></main>
        <footer class="subtitle"><p id="caption"></p></footer>
        <div class="progress-shell"><div id="progressBar" class="progress-bar"></div></div>
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

function stylesCss() {
  return `:root{--bg:#081321;--panel:rgba(13,27,47,.78);--line:rgba(56,189,248,.16);--text:#eaf4ff;--muted:#a9bfdc;--cyan:#38d5ff;--mint:#2dd4bf;--amber:#fbbf24;--rose:#fb7185;--blue:#60a5fa}*{box-sizing:border-box}body{margin:0;overflow:hidden;background:#06101d;color:var(--text);font-family:Inter,"Microsoft YaHei","PingFang SC",system-ui,sans-serif}.viewport{width:100vw;height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 78% 20%,rgba(45,212,191,.12),transparent 30%),linear-gradient(135deg,#06111f,#0f172a 58%,#05251f)}.stage{position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform-origin:center;background:#081321;overflow:hidden}.grid-bg{position:absolute;inset:0;background:linear-gradient(90deg,var(--line) 1px,transparent 1px) 0 0/96px 96px,linear-gradient(0deg,var(--line) 1px,transparent 1px) 0 0/96px 96px,radial-gradient(circle at 70% 64%,rgba(45,212,191,.11),transparent 38%);pointer-events:none}.hud{position:absolute;left:58px;right:58px;top:42px;z-index:5;display:flex;align-items:flex-start;justify-content:space-between}.kicker,.eyebrow{display:block;color:var(--cyan);font-size:20px;font-weight:900;letter-spacing:.08em}.hud strong{display:block;margin-top:8px;font-size:27px}.step-counter{display:flex;gap:10px;align-items:center;border:1px solid rgba(56,213,255,.28);background:rgba(8,18,33,.72);padding:13px 18px;font-size:23px;font-weight:900}.controls{position:absolute;right:58px;top:104px;z-index:6;display:flex;gap:12px}.controls button{border:1px solid rgba(56,213,255,.35);background:rgba(8,18,33,.78);color:#e6f7ff;font-size:18px;font-weight:900;padding:12px 18px;cursor:pointer}.scene{position:absolute;left:58px;right:58px;top:150px;bottom:178px;z-index:2}.subtitle{position:absolute;left:58px;right:58px;bottom:86px;z-index:4;border-left:5px solid var(--cyan);background:rgba(2,8,23,.78);padding:19px 26px;min-height:76px}.subtitle p{margin:0;font-size:26px;line-height:1.45;color:#e4f7ff}.progress-shell{position:absolute;left:58px;right:58px;bottom:72px;height:5px;background:rgba(148,163,184,.18);z-index:4}.progress-bar{height:100%;background:linear-gradient(90deg,var(--cyan),var(--mint));width:0}.layout{height:100%;display:grid;grid-template-columns:520px minmax(0,1fr);gap:48px;align-items:center}.copy{display:grid;gap:22px;align-content:center;min-width:0}.title{margin:0;font-size:64px;line-height:1.08}.lead{margin:0;color:var(--muted);font-size:25px;line-height:1.55}.board{height:620px;border:1px solid rgba(148,163,184,.22);background:rgba(15,23,42,.7);box-shadow:0 28px 90px rgba(0,0,0,.34);border-radius:8px;padding:34px;display:grid;place-items:center;overflow:hidden}.chips{display:flex;gap:14px;flex-wrap:wrap}.chip{border:1px solid rgba(56,213,255,.28);background:rgba(56,213,255,.08);padding:14px 18px;color:#dff8ff;font-size:24px;font-weight:900}.chip.hot{border-color:rgba(45,212,191,.75);background:rgba(45,212,191,.18)}.array{display:flex;gap:14px;align-items:end;justify-content:center}.cell{width:110px;height:92px;display:grid;grid-template-rows:1fr 28px;border:1px solid rgba(56,213,255,.32);background:rgba(2,8,23,.65);font-weight:900;overflow:hidden}.cell b{display:grid;place-items:center;font-size:34px}.cell span{display:grid;place-items:center;background:rgba(56,213,255,.1);color:#a9dfff;font-size:16px}.cell.hot{border-color:var(--mint);background:rgba(45,212,191,.18);transform:translateY(-10px)}.target{display:grid;place-items:center;border:1px solid rgba(251,191,36,.5);background:rgba(251,191,36,.13);color:#fde68a;min-width:150px;height:92px;font-size:34px;font-weight:900}.arrow{font-size:48px;color:var(--cyan);font-weight:900}.flow{display:flex;align-items:center;justify-content:center;gap:20px}.flow-card{min-width:170px;min-height:104px;border:1px solid rgba(56,213,255,.28);background:rgba(2,8,23,.55);display:grid;place-items:center;text-align:center;padding:16px;font-size:27px;font-weight:900}.flow-card.hot{border-color:var(--mint);background:rgba(45,212,191,.2)}.hash-table{display:grid;grid-template-columns:220px 220px;gap:10px}.hash-head,.hash-item{border:1px solid rgba(56,213,255,.22);padding:18px;text-align:center;font-size:24px;font-weight:900}.hash-head{color:#9eeaff;background:rgba(56,213,255,.1)}.hash-item{background:rgba(2,8,23,.52)}.hash-item.hot{background:rgba(45,212,191,.18);border-color:var(--mint)}.trace-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:30px;width:100%;align-items:center}.steps{display:grid;gap:16px}.step-card{border:1px solid rgba(56,213,255,.22);background:rgba(2,8,23,.56);padding:18px 20px;font-size:25px;font-weight:900}.step-card.hot{border-color:var(--mint);background:rgba(45,212,191,.18)}.compare{display:grid;grid-template-columns:1fr 1fr;gap:30px;width:100%}.compare-card{min-height:330px;border:1px solid rgba(148,163,184,.24);background:rgba(2,8,23,.52);padding:30px;display:grid;align-content:center;justify-items:center;gap:22px}.compare-card strong{font-size:44px}.big-o{font-size:70px;font-weight:1000;color:#eaffff}.mini-grid{display:grid;grid-template-columns:repeat(4,70px);gap:8px}.mini{height:46px;border:1px solid rgba(56,213,255,.22);background:rgba(56,213,255,.08)}.mini.hot{background:rgba(251,191,36,.24);border-color:var(--amber)}.code-lines{width:100%;display:grid;gap:15px}.code-lines.tight{gap:8px}.code-line{font-family:Consolas,"SFMono-Regular",monospace;font-size:28px;border:1px solid rgba(56,213,255,.18);background:rgba(2,8,23,.7);padding:18px 22px;color:#d1fae5;white-space:pre;text-align:left}.code-lines.tight .code-line{font-size:20px;padding:8px 16px}.code-line.hot{border-color:var(--mint);background:rgba(45,212,191,.15)}.code-line.dim{color:#93a4bd}.variant-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;width:100%}.variant{min-height:300px;border:1px solid rgba(148,163,184,.24);background:rgba(2,8,23,.56);padding:26px;display:grid;align-content:center;justify-items:center;text-align:center;gap:18px}.variant strong{font-size:34px}.variant .cost{font-size:42px;font-weight:1000;color:#9eeaff}.variant.hot{border-color:var(--mint);background:rgba(45,212,191,.16)}.fade{animation:rise .36s ease both}@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`;
}

function appJs() {
  return `const slides=${JSON.stringify(slides, null, 2)};
const stage=document.getElementById('stage'),scene=document.getElementById('scene'),caption=document.getElementById('caption'),stepNow=document.getElementById('stepNow'),stepTotal=document.getElementById('stepTotal'),progressBar=document.getElementById('progressBar'),prevBtn=document.getElementById('prevBtn'),nextBtn=document.getElementById('nextBtn'),audioBtn=document.getElementById('audioBtn'),autoBtn=document.getElementById('autoBtn');let step=Math.max(0,Math.min(slides.length-1,Number(new URLSearchParams(location.search).get('step')||1)-1)),audioMode='manual',audioTimer=null;const audio=new Audio();stepTotal.textContent=String(slides.length).padStart(2,'0');
function nums(active=[]){const values=[2,7,11,15];return '<div class="array">'+values.map((v,i)=>'<div class="cell '+(active.includes(i)?'hot':'')+'"><b>'+v+'</b><span>index '+i+'</span></div>').join('')+'</div>'}
function intro(){return '<div class="board"><div class="chips"><div class="chip hot">简单</div><div class="chip hot">哈希</div><div class="chip">数组</div><div class="chip">空间换时间</div></div></div>'}
function problem(){return '<div class="board"><div class="flow">'+nums([0,1])+'<div class="target">target = 9</div><div class="arrow">→</div><div class="target">return [0,1]</div></div></div>'}
function bruteDemo(){return '<div class="board"><div class="trace-grid"><div><div class="array">'+[2,7,11,15].map((v,i)=>'<div class="cell '+(i<2?'hot':'')+'"><b>'+v+'</b><span>'+['i=0','j=1','j=2','j=3'][i]+'</span></div>').join('')+'</div><div style="height:28px"></div><div class="flow"><div class="flow-card hot">固定 i</div><div class="arrow">→</div><div class="flow-card hot">枚举 j</div><div class="arrow">→</div><div class="flow-card">检查和</div></div></div><div class="steps"><div class="step-card hot">for i in range(n)</div><div class="step-card hot">for j in range(i + 1, n)</div><div class="step-card">if nums[i] + nums[j] == target</div><div class="step-card hot">return [i, j]</div></div></div></div>'}
function hashFrame(){return '<div class="board"><div class="flow"><div class="flow-card">当前 x</div><div class="arrow">→</div><div class="flow-card hot">need = target - x</div><div class="arrow">→</div><div class="flow-card">查 seen</div><div class="arrow">→</div><div class="flow-card hot">返回下标</div></div></div>'}
function trace(){return '<div class="board"><div class="trace-grid"><div><div class="array">'+[2,7,11,15].map((v,i)=>'<div class="cell '+(i<2?'hot':'')+'"><b>'+v+'</b><span>i='+i+'</span></div>').join('')+'</div></div><div class="steps"><div class="step-card">i=0, x=2, need=7</div><div class="step-card hot">seen = {2:0}</div><div class="step-card">i=1, x=7, need=2</div><div class="step-card hot">need in seen → [0,1]</div></div></div></div>'}
function compare(){return '<div class="board"><div class="compare"><div class="compare-card"><strong>暴力双循环</strong><div class="mini-grid">'+Array.from({length:16},(_,i)=>'<div class="mini '+(i%5===0?'hot':'')+'"></div>').join('')+'</div><div class="big-o">O(n²)</div></div><div class="compare-card"><strong>哈希表</strong><div class="flow"><div class="flow-card">扫一遍</div><div class="arrow">+</div><div class="flow-card hot">O(1) 查</div></div><div class="big-o">O(n)</div></div></div></div>'}
function duplicate(){return '<div class="board"><div class="trace-grid"><div><div class="array"><div class="cell hot"><b>3</b><span>index 0</span></div><div class="cell hot"><b>3</b><span>index 1</span></div></div><div style="height:24px"></div><div class="target">target = 6</div></div><div class="steps"><div class="step-card">第一个 3：need=3，seen 为空</div><div class="step-card hot">先查不到，再存 {3:0}</div><div class="step-card">第二个 3：need=3</div><div class="step-card hot">查到 index 0 → 返回 [0,1]</div></div></div></div>'}
function code(){return '<div class="board"><div class="code-lines tight"><div class="code-line dim">class Solution:</div><div class="code-line dim">    def twoSum(self, nums, target):</div><div class="code-line hot">        seen = {}</div><div class="code-line">        for i, x in enumerate(nums):</div><div class="code-line hot">            need = target - x</div><div class="code-line hot">            if need in seen:</div><div class="code-line hot">                return [seen[need], i]</div><div class="code-line">            seen[x] = i</div></div></div>'}
function bruteCode(){return '<div class="board"><div class="code-lines tight"><div class="code-line dim">class Solution:</div><div class="code-line dim">    def twoSum(self, nums, target):</div><div class="code-line hot">        for i in range(len(nums)):</div><div class="code-line hot">            for j in range(i + 1, len(nums)):</div><div class="code-line">                if nums[i] + nums[j] == target:</div><div class="code-line hot">                    return [i, j]</div></div></div>'}
function sortCode(){return '<div class="board"><div class="code-lines tight"><div class="code-line dim">class Solution:</div><div class="code-line dim">    def twoSum(self, nums, target):</div><div class="code-line hot">        arr = sorted((x, i) for i, x in enumerate(nums))</div><div class="code-line">        left, right = 0, len(arr) - 1</div><div class="code-line hot">        while left < right:</div><div class="code-line">            total = arr[left][0] + arr[right][0]</div><div class="code-line">            if total == target:</div><div class="code-line hot">                return [arr[left][1], arr[right][1]]</div><div class="code-line hot">            if total < target:</div><div class="code-line hot">                left += 1</div><div class="code-line hot">            else:</div><div class="code-line hot">                right -= 1</div></div></div>'}
function variants(){return '<div class="board"><div class="variant-grid"><div class="variant"><strong>暴力</strong><div class="cost">O(n²)</div><p>适合读题建模</p></div><div class="variant hot"><strong>哈希</strong><div class="cost">O(n)</div><p>面试推荐</p></div><div class="variant"><strong>排序双指针</strong><div class="cost">O(n log n)</div><p>适合追问取舍</p></div></div></div>'}
const renderers={intro,problem,bruteDemo,compare,hashFrame,trace,duplicate,code,bruteCode,sortCode,variants};
function render(){const s=slides[step];stepNow.textContent=String(step+1).padStart(2,'0');progressBar.style.width=((step+1)/slides.length*100)+'%';caption.textContent=s.caption;scene.innerHTML='<div class="layout fade"><section class="copy"><span class="eyebrow">'+s.eyebrow+'</span><h1 class="title">'+s.title+'</h1><p class="lead">'+s.caption+'</p></section>'+renderers[s.type]()+'</div>';document.title=s.title+' | 两数之和解析动画';playAudio()}
function src(){return './audio/'+slides[step].audio}function estimate(t){return Math.max(3500,Math.min(11000,String(t||'').length*230))}function clearTimer(){if(audioTimer){clearTimeout(audioTimer);audioTimer=null}}function stopAudio(){audio.pause();audio.removeAttribute('src');audio.load();clearTimer()}function fallback(){clearTimer();if(audioMode==='auto')audioTimer=setTimeout(()=>{if(step<slides.length-1)go(1)},estimate(slides[step]?.caption))}function playAudio(){stopAudio();if(audioMode==='manual')return;audio.src=src();audio.onended=()=>{clearTimer();if(audioMode==='auto')audioTimer=setTimeout(()=>{if(step<slides.length-1)go(1)},200)};audio.onerror=fallback;audio.play().catch(fallback)}function refresh(){audioBtn.textContent=audioMode==='manual'?'声音关闭':'声音开启';autoBtn.textContent=audioMode==='auto'?'停止自动':'自动播放'}function go(d){step=Math.max(0,Math.min(slides.length-1,step+d));render()}function stopAuto(){if(audioMode==='auto')audioMode='audio';stopAudio();refresh()}function toggleAudio(){if(audioMode==='manual'){audioMode='audio';refresh();playAudio()}else{audioMode='manual';stopAudio();refresh()}}function toggleAuto(){audioMode=audioMode==='auto'?'audio':'auto';refresh();playAudio()}prevBtn.onclick=()=>{stopAuto();go(-1)};nextBtn.onclick=()=>{stopAuto();go(1)};audioBtn.onclick=toggleAudio;autoBtn.onclick=toggleAuto;stage.onclick=e=>{if(e.target.closest('button'))return;stopAuto();go(1)};window.onkeydown=e=>{if(e.key==='ArrowLeft'){stopAuto();go(-1)}if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();stopAuto();go(1)}if(e.key.toLowerCase()==='m')toggleAudio();if(e.key.toLowerCase()==='a')toggleAuto()};function fit(){stage.style.transform='translate(-50%,-50%) scale('+Math.min(innerWidth/1920,innerHeight/1080)+')'}addEventListener('resize',fit);fit();refresh();render();`;
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(join(OUT_DIR, 'index.html'), indexHtml(), 'utf8');
await writeFile(join(OUT_DIR, 'styles.css'), stylesCss(), 'utf8');
await writeFile(join(OUT_DIR, 'app.js'), appJs(), 'utf8');
await writeFile(join(PROJECT_DIR, 'audio-segments.json'), JSON.stringify(audioSegments, null, 2), 'utf8');

console.log(`Updated visual-first two-sum page: ${OUT_DIR}`);
