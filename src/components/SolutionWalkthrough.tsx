'use client';

import { useEffect, useMemo, useState } from 'react';
import { Problem } from '@/types';
import { getProblemRefinement } from '@/data/problemRefinements';
import { getSolutionVariants, SolutionVariant } from '@/data/solutionVariants';
import CodeBlock from './CodeBlock';

interface SolutionWalkthroughProps {
  problem: Problem;
}

const defaultComplexity: Record<string, { time: string; space: string; note: string }> = {
  '哈希': { time: '通常 O(n)', space: '通常 O(n)', note: '用额外哈希表换取快速查找。' },
  '双指针': { time: '通常 O(n)', space: '通常 O(1)', note: '两个指针整体只线性移动。' },
  '滑动窗口': { time: '通常 O(n)', space: '视窗口维护结构而定', note: 'left/right 每个位置最多访问常数次。' },
  '链表': { time: '通常 O(n)', space: '通常 O(1)', note: '主要成本是遍历链表，递归写法会有调用栈。' },
  '二叉树': { time: '通常 O(n)', space: '通常 O(h) 或 O(n)', note: '每个节点通常访问一次，空间取决于递归深度或队列宽度。' },
  '回溯': { time: '通常为指数级', space: '取决于递归深度和结果集', note: '回溯要枚举决策树，剪枝只能减少常数或部分分支。' },
  '动态规划': { time: '取决于状态数 × 转移成本', space: '取决于 dp 数组规模', note: '先数状态，再看每个状态如何转移。' },
  '多维动态规划': { time: '取决于二维/多维状态规模', space: '取决于 dp 表大小', note: '二维 DP 常见空间为 O(mn)，可视依赖关系滚动优化。' },
  '二分查找': { time: '通常 O(log n)', space: '通常 O(1)', note: '每次排除一半候选区间。' },
  '栈': { time: '通常 O(n)', space: '通常 O(n)', note: '每个元素最多入栈、出栈一次。' },
  '堆': { time: '通常 O(n log k) 或 O(n log n)', space: '通常 O(k) 或 O(n)', note: '关键看堆大小和入堆出堆次数。' },
  '图论': { time: '通常 O(V + E)', space: '通常 O(V + E)', note: '建图和遍历图的成本取决于点数与边数。' },
  '贪心': { time: '通常 O(n) 或排序后 O(n log n)', space: '通常 O(1) 或 O(n)', note: '如果需要排序，排序往往是主要复杂度。' },
};

const badgeClass: Record<SolutionVariant['badge'], string> = {
  '暴力': 'bg-rose-50 text-rose-700 ring-rose-100',
  '基础': 'bg-slate-100 text-slate-700 ring-slate-200',
  '推荐': 'bg-blue-50 text-blue-700 ring-blue-100',
  '备选': 'bg-amber-50 text-amber-700 ring-amber-100',
  '进阶': 'bg-violet-50 text-violet-700 ring-violet-100',
};

function getPseudoCode(problem: Problem, handwriteSteps?: string[]) {
  if (handwriteSteps?.length) {
    return handwriteSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');
  }
  return problem.pseudocode.includes('参考 level6') ? problem.hints.level5 : problem.pseudocode;
}

function extractComplexity(problem: Problem) {
  const hasConcreteTime = problem.complexity.time && !problem.complexity.time.includes('详见');
  const hasConcreteSpace = problem.complexity.space && !problem.complexity.space.includes('详见');
  if (hasConcreteTime || hasConcreteSpace) {
    return {
      time: hasConcreteTime ? problem.complexity.time : '见下方说明',
      space: hasConcreteSpace ? problem.complexity.space : '见下方说明',
      note: '来自题目数据。',
    };
  }

  const text = `${problem.optimizedIdea}\n${problem.hints.level4}\n${problem.hints.level5}`;
  const time = text.match(/时间(?:复杂度)?(?:是|为|:|：)?\s*(O[（(][^，。；;\n]+[）)]?)/)?.[1];
  const space = text.match(/空间(?:复杂度)?(?:是|为|:|：)?\s*(O[（(][^，。；;\n]+[）)]?)/)?.[1];
  const fallback = defaultComplexity[problem.category] || { time: '结合代码逐步分析', space: '结合代码逐步分析', note: '当前题型没有统一复杂度，需要根据具体实现判断。' };

  return {
    time: time || fallback.time,
    space: space || fallback.space,
    note: time || space ? '从优化思路中提取；建议对照代码再手算一遍。' : fallback.note,
  };
}

function splitList(items: string[]) {
  return items.flatMap((item) => item.split(/;\s*/).map((part) => part.trim()).filter(Boolean));
}

function buildInitialOpenState(variants: SolutionVariant[]) {
  const recommendedIndex = variants.findIndex((item) => item.name === '面试推荐写法');
  const firstRecommendedIndex = variants.findIndex((item) => item.badge === '推荐');
  const openIndex = recommendedIndex >= 0 ? recommendedIndex : Math.max(firstRecommendedIndex, 0);
  return variants.reduce<Record<number, boolean>>((acc, _item, index) => {
    acc[index] = index === openIndex;
    return acc;
  }, {});
}

function ProcessBlock({ content }: { content: string }) {
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
  return (
    <ol className="process-list grid gap-2">
      {lines.map((line, index) => (
        <li key={`${line}-${index}`} className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-blue-950">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{index + 1}</span>
          <span>{line.replace(/^\d+[.、]\s*/, '')}</span>
        </li>
      ))}
    </ol>
  );
}

function ExplanationBlock({ title, icon, children }: { title: string; icon: string; children: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 font-bold text-slate-950">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <p className="whitespace-pre-wrap text-slate-600">{children}</p>
    </div>
  );
}

function MultiSolutionSection({ variants }: { variants: SolutionVariant[] }) {
  const [openMap, setOpenMap] = useState<Record<number, boolean>>(() => buildInitialOpenState(variants));

  useEffect(() => {
    setOpenMap(buildInitialOpenState(variants));
  }, [variants]);

  const allOpen = variants.length > 0 && variants.every((_item, index) => openMap[index]);

  const toggleAll = () => {
    setOpenMap(variants.reduce<Record<number, boolean>>((acc, _item, index) => {
      acc[index] = !allOpen;
      return acc;
    }, {}));
  };

  const toggleOne = (index: number) => {
    setOpenMap((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (!variants.length) return null;

  return (
    <section className="study-card multi-solution-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧩</span>
              <h2 className="font-bold text-slate-950">多解法对比：Python3.9 手撕全链路</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              本题收录 {variants.length} 种常见面试解法。先看复杂度取舍，再展开代码；不要只背一种写法。
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className="shrink-0 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-50"
          >
            {allOpen ? '收起全部代码' : '展开全部代码'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-6">
        <div className="solution-compare-grid grid gap-3 lg:grid-cols-3">
          {variants.map((variant, index) => (
            <button
              type="button"
              key={`${variant.name}-${index}`}
              onClick={() => toggleOne(index)}
              className="solution-summary-card rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
              aria-expanded={Boolean(openMap[index])}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-slate-950">{index + 1}. {variant.name}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${badgeClass[variant.badge]}`}>{variant.badge}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
                  <div className="text-xs font-bold text-slate-400">时间</div>
                  <div className="mt-1 font-bold text-blue-700">{variant.time}</div>
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-slate-100">
                  <div className="text-xs font-bold text-slate-400">空间</div>
                  <div className="mt-1 font-bold text-emerald-700">{variant.space}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">{openMap[index] ? '点击收起这份代码' : '点击展开这份代码'}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {variants.map((variant, index) => (
            <article key={`${variant.name}-detail-${index}`} className="solution-detail-card overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => toggleOne(index)}
                className="flex w-full items-center justify-between gap-4 bg-slate-50 px-5 py-4 text-left transition hover:bg-blue-50"
                aria-expanded={Boolean(openMap[index])}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-950">解法 {index + 1}：{variant.name}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${badgeClass[variant.badge]}`}>{variant.badge}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">时间 {variant.time} · 空间 {variant.space}</p>
                </div>
                <span className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                  {openMap[index] ? '收起' : '展开'}
                </span>
              </button>

              {openMap[index] && (
                <div className="grid gap-4 p-5">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="solution-label">思路</div>
                    <p className="mt-2 text-blue-950">{variant.idea}</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-blue-100 bg-white p-4">
                      <div className="solution-label">时间复杂度</div>
                      <div className="mt-2 text-xl font-bold text-blue-700">{variant.time}</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                      <div className="solution-label text-emerald-700">空间复杂度</div>
                      <div className="mt-2 text-xl font-bold text-emerald-700">{variant.space}</div>
                    </div>
                  </div>
                  <p className="rounded-2xl bg-slate-50 p-4 text-slate-600 ring-1 ring-slate-100">{variant.complexityDetail}</p>

                  {variant.notes.length > 0 && (
                    <ul className="grid gap-2">
                      {variant.notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="rounded-xl bg-amber-50 px-4 py-3 text-amber-900 ring-1 ring-amber-100">{note}</li>
                      ))}
                    </ul>
                  )}

                  <CodeBlock code={variant.code} language="Python3.9" />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SolutionWalkthrough({ problem }: SolutionWalkthroughProps) {
  const refinement = getProblemRefinement(problem.leetcodeId);
  const variants = useMemo(() => getSolutionVariants(problem.leetcodeId), [problem.leetcodeId]);
  const primaryVariant = variants.find((item) => item.name === '面试推荐写法') ?? variants.find((item) => item.badge === '推荐');
  const complexity = primaryVariant
    ? {
        time: primaryVariant.time,
        space: primaryVariant.space,
        note: primaryVariant.complexityDetail,
      }
    : refinement
      ? {
          time: refinement.complexity.time,
          space: refinement.complexity.space,
          note: refinement.complexity.detail,
        }
      : extractComplexity(problem);
  const mistakes = splitList(refinement?.commonPitfalls ?? problem.commonMistakes);
  const reviewQuestions = splitList(problem.reviewQuestions);
  const checklist = refinement?.interviewChecklist ?? reviewQuestions;
  const handwriteSteps = refinement?.handwriteSteps ?? [];
  const edgeCases = refinement?.edgeCases ?? [];
  const annotatedCode = primaryVariant?.code || refinement?.annotatedCode || problem.solutionCode || problem.hints.level6;
  const coreSummary = refinement?.coreIdea
    ? `${problem.summary}\n\n核心抓手：${refinement.coreIdea}`
    : problem.summary;

  return (
    <div className="grid gap-5">
      <section id="answer" className="study-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <h2 className="font-bold text-slate-950">完整解题拆解</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-500">先理解题目本质，再对比多种 Python3.9 解法，最后锁定面试手撕版本。</p>
        </div>

        <div className="grid gap-4 p-6">
          <ExplanationBlock title="1. 题目本质" icon="🔎">
            {coreSummary}
          </ExplanationBlock>
          <ExplanationBlock title="2. 暴力解法" icon="🧱">
            {problem.bruteForceIdea}
          </ExplanationBlock>
          <ExplanationBlock title="3. 优化突破口" icon="🚀">
            {problem.optimizedIdea}
          </ExplanationBlock>

          {handwriteSteps.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-base font-bold text-blue-950">
                <span>🧠</span>
                <span>4. 小白手撕流程</span>
              </div>
              <ol className="grid gap-3">
                {handwriteSteps.map((step, index) => (
                  <li key={index} className="flex gap-3 rounded-2xl bg-white/80 p-4 text-sm leading-7 text-blue-950 ring-1 ring-blue-100">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-base font-bold text-slate-950">
              <span>🧭</span>
              <span>{handwriteSteps.length > 0 ? '5' : '4'}. 伪代码 / 流程</span>
            </div>
            <ProcessBlock content={getPseudoCode(problem, handwriteSteps)} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-base font-bold text-slate-950">
              <span>💻</span>
              <span>{handwriteSteps.length > 0 ? '6' : '5'}. 面试推荐代码</span>
            </div>
            <p className="mb-3 text-sm leading-7 text-slate-500">下面这份是优先手撕版本。其他写法和复杂度差异在“多解法对比”里逐个展开。</p>
            <CodeBlock code={annotatedCode} language="Python3.9" />
          </div>
        </div>
      </section>

      <MultiSolutionSection variants={variants} />

      {edgeCases.length > 0 && (
        <section className="study-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">🧪</span>
            <h2 className="font-bold text-slate-950">边界样例 / 必测用例</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {edgeCases.map((edgeCase, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-xs font-bold text-slate-500">样例 {index + 1}</div>
                <div className="grid gap-3 text-sm leading-7">
                  <div>
                    <div className="mb-1 text-xs font-bold text-slate-500">输入</div>
                    <code className="block rounded-xl bg-white px-3 py-2 text-slate-800 ring-1 ring-slate-200">{edgeCase.input}</code>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-bold text-slate-500">期望</div>
                    <code className="block rounded-xl bg-white px-3 py-2 text-slate-800 ring-1 ring-slate-200">{edgeCase.expected}</code>
                  </div>
                  <p className="text-slate-600">{edgeCase.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="study-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <h2 className="font-bold text-slate-950">推荐解法复杂度分析</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <div className="text-xs font-bold text-blue-700">时间复杂度</div>
            <div className="mt-2 text-xl font-bold text-blue-950">{complexity.time}</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
            <div className="text-xs font-bold text-emerald-700">空间复杂度</div>
            <div className="mt-2 text-xl font-bold text-emerald-950">{complexity.space}</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-500">{complexity.note}</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="study-card rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <h2 className="font-bold text-amber-950">常见错误</h2>
          </div>
          <ul className="grid gap-3">
            {mistakes.map((mistake, index) => (
              <li key={index} className="rounded-2xl bg-white/80 p-4 text-sm leading-7 text-amber-900 ring-1 ring-amber-100">
                {mistake}
              </li>
            ))}
          </ul>
        </div>

        <div className="study-card rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">🔁</span>
            <h2 className="font-bold text-indigo-950">复盘问题</h2>
          </div>
          <ul className="grid gap-3">
            {reviewQuestions.map((question, index) => (
              <li key={index} className="rounded-2xl bg-white/80 p-4 text-sm leading-7 text-indigo-900 ring-1 ring-indigo-100">
                {question}
              </li>
            ))}
          </ul>
        </div>

        <div className="study-card rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">🎤</span>
            <h2 className="font-bold text-emerald-950">面试手撕检查单</h2>
          </div>
          <ul className="grid gap-3">
            {checklist.map((item, index) => (
              <li key={index} className="rounded-2xl bg-white/80 p-4 text-sm leading-7 text-emerald-900 ring-1 ring-emerald-100">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
