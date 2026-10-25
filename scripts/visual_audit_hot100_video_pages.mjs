import { spawn } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SHIP_ROOT = 'C:\\Users\\11873\\Desktop\\ship';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = 'C:\\tmp\\hot100-visual-audit-profile';
const REPORT = resolve('visual-audit-hot100.json');
const PORT = 9339;
const LIMIT_SLUGS = new Set(process.argv.slice(2));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJson(url, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // Chrome may still be starting.
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function cdp(wsUrl) {
  const WebSocket = globalThis.WebSocket;
  if (!WebSocket) throw new Error('This Node runtime does not expose WebSocket.');
  const socket = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      data.error ? reject(new Error(JSON.stringify(data.error))) : resolve(data.result);
    }
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  return {
    send(method, params = {}) {
      const msgId = ++id;
      socket.send(JSON.stringify({ id: msgId, method, params }));
      return new Promise((resolve, reject) => pending.set(msgId, { resolve, reject }));
    },
    close() {
      socket.close();
    },
  };
}

function extractSlides(app) {
  const match = app.match(/^const slides=(\[[\s\S]*?\]);\nconst stage=/);
  if (!match) return [];
  return JSON.parse(match[1]);
}

function fileUrl(slug, step) {
  return `file:///C:/Users/11873/Desktop/ship/${slug}/presentation/index.html?step=${step}`;
}

function visualAuditExpression() {
  return `(() => {
    const round = (n) => Math.round(n);
    const text = (el) => (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 90);
    const issue = (type, el, extra = {}) => {
      const r = el.getBoundingClientRect();
      return {
        type,
        selector: el.className || el.tagName,
        text: text(el),
        rect: { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) },
        scroll: { w: el.scrollWidth, h: el.scrollHeight, cw: el.clientWidth, ch: el.clientHeight },
        ...extra
      };
    };
    const issues = [];
    const scene = document.getElementById('scene');
    const stage = document.getElementById('stage');
    if (!scene || !stage || !scene.children.length) {
      issues.push({ type: 'blank-scene', text: 'scene missing or empty' });
      return issues;
    }
    const sr = scene.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.left < -6 || stageRect.top < -6 || stageRect.right > innerWidth + 6 || stageRect.bottom > innerHeight + 6) {
      issues.push({ type: 'stage-outside-window', rect: { x: round(stageRect.x), y: round(stageRect.y), w: round(stageRect.width), h: round(stageRect.height) } });
    }
    const selectors = [
      '.lead','.subtitle p','.card p','.flow-card','.trace-item','.code-line',
      '.graphic-pill span','.relation-card span','.cell','.node','.chip','.variant p',
      '.direct-node span','.walk-step span','.pattern-row span','.compare-card span'
    ].join(',');
    for (const el of document.querySelectorAll(selectors)) {
      if (el.classList.contains('code-line')) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      if (el.scrollWidth > el.clientWidth + 3 || el.scrollHeight > el.clientHeight + 3) {
        issues.push(issue('text-overflow', el));
      }
    }
    for (const el of document.querySelectorAll('.board,.graphic-board,.code-board,.code-focus-board,.diagram')) {
      const r = el.getBoundingClientRect();
      if (r.right < sr.left + 20 || r.left > sr.right - 20 || r.bottom < sr.top + 20 || r.top > sr.bottom - 20) {
        issues.push(issue('major-panel-outside-scene', el));
      }
    }
    for (const el of document.querySelectorAll('.code-line')) {
      const style = getComputedStyle(el);
      const nowrap = style.whiteSpace === 'pre' || style.whiteSpace === 'nowrap';
      if ((nowrap && el.scrollWidth > el.clientWidth + 3) || el.scrollHeight > el.clientHeight + 3) {
        issues.push(issue('code-line-clipped', el));
      }
    }
    const diagram = document.querySelector('.diagram');
    if (diagram) {
      const r = diagram.getBoundingClientRect();
      const meaningful = diagram.querySelectorAll('svg rect, svg circle, svg path, svg line, svg polygon, .cell, .node, .flow-card, .grid-cell, .dp-cell, .direct-node, .walk-step, .visual-point, .relation-card').length;
      if (r.width > 200 && r.height > 160 && meaningful < 2) {
        issues.push(issue('weak-diagram', diagram, { meaningful }));
      }
    }
    return issues.slice(0, 20);
  })()`;
}

async function main() {
  if (!existsSync(CHROME)) throw new Error(`Chrome not found: ${CHROME}`);
  await rm(PROFILE, { recursive: true, force: true });
  await mkdir(PROFILE, { recursive: true });
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1920,1080',
    `--user-data-dir=${PROFILE}`,
    'about:blank',
  ], { stdio: 'ignore' });

  try {
    await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
    const targets = await waitForJson(`http://127.0.0.1:${PORT}/json/list`);
    const pageTarget = targets.find((item) => item.type === 'page' && item.webSocketDebuggerUrl);
    if (!pageTarget) throw new Error('No page target found in Chrome DevTools.');
    const client = await cdp(pageTarget.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    const manifestPath = join(SHIP_ROOT, 'hot100-video-manifest.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const dirs = manifest
      .map((item) => item.slug)
      .filter((slug) => !LIMIT_SLUGS.size || LIMIT_SLUGS.has(slug))
      .sort();

    const findings = [];
    for (const slug of dirs) {
      const appPath = join(SHIP_ROOT, slug, 'presentation', 'app.js');
      if (!existsSync(appPath)) continue;
      const slides = extractSlides(await readFile(appPath, 'utf8'));
      if (!slides.length) {
        findings.push({ slug, step: 0, issues: [{ type: 'slides-not-found' }] });
        continue;
      }
      for (let step = 1; step <= slides.length; step += 1) {
        await client.send('Page.navigate', { url: fileUrl(slug, step) });
        await client.send('Page.loadEventFired').catch(() => {});
        await sleep(65);
        const result = await client.send('Runtime.evaluate', {
          expression: visualAuditExpression(),
          returnByValue: true,
          awaitPromise: true,
        });
        const issues = result.result?.value || [];
        if (issues.length) findings.push({ slug, step, title: slides[step - 1]?.title, issues });
      }
    }
    client.close();
    const grouped = findings.reduce((acc, item) => {
      for (const issue of item.issues) acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {});
    const report = { checkedAt: new Date().toISOString(), pageCount: dirs.length, findingCount: findings.length, grouped, findings };
    await writeFile(REPORT, JSON.stringify(report, null, 2), 'utf8');
    console.log(JSON.stringify({ pageCount: report.pageCount, findingCount: report.findingCount, grouped, report: REPORT }, null, 2));
  } finally {
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
