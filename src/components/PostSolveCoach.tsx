'use client';

import { useMemo } from 'react';
import { Problem } from '@/types';
import { getProblemRefinement } from '@/data/problemRefinements';
import { useProgress } from '@/hooks/useProgress';

interface PostSolveCoachProps {
  problem: Problem;
}

type DebugRecipe = {
  locate: string;
  fix: string;
  retest: string;
};

const categoryDebugRecipes: Record<string, DebugRecipe> = {
  '哈希': {
    locate: '把每一轮的 key、value、查询时机写出来，重点看"先查还是先存"。',
    fix: '统一哈希表含义：key 存要快速查的东西，value 存答案需要返回的东西；避免把当前元素和自己匹配。',
    retest: '用重复值、负数、只有两个元素的样例重新跑一遍。',
  },
  '前缀和': {
    locate: '列出 prefix、prefix-k、哈希计数表三列，观察查询和更新顺序。',
    fix: '先用已有前缀和计数贡献答案，再把当前 prefix 加入表，避免把空区间算进去。',
    retest: '用含负数、0、多个答案的数组验证。',
  },
  '双指针': {
    locate: '画出 left/right 位置和每次移动原因，检查是否有指针不动导致死循环。',
    fix: '明确循环不变量：窗口/区间里保留什么，排除什么；每轮至少移动一个指针。',
    retest: '用空数组、单元素、全重复、边界相遇的样例验证。',
  },
  '滑动窗口': {
    locate: '记录 right 扩张、left 收缩、窗口内统计值，检查 valid 条件是否更新同步。',
    fix: '先扩右边，再在条件不满足时收左边；答案只在窗口合法时更新。',
    retest: '用最短窗口、不存在答案、窗口刚好等于答案的样例验证。',
  },
  '单调队列': {
    locate: '逐步写出队列下标和值，检查队头是否过期、队尾是否保持单调。',
    fix: '先移除过期队头，再维护队尾单调性，队头始终是当前窗口最大/最小候选。',
    retest: '用递增、递减、重复值、k=1 的样例验证。',
  },
  '链表': {
    locate: '在纸上标出 prev、cur、next/dummy，确认改指针前有没有保存后续节点。',
    fix: '所有链表题先处理 dummy 或空节点；改 next 前先保存 next，最后返回正确头节点。',
    retest: '用空链表、单节点、删除/反转头节点、长度不一致样例验证。',
  },
  '二叉树': {
    locate: '先写清楚递归函数返回什么，再用一个 3 节点小树手推左右子树返回值。',
    fix: '补齐终止条件和单层逻辑，别把"遍历过程"和"返回值含义"混在一起。',
    retest: '用空树、单节点、只有左/右子树、极端链状树验证。',
  },
  '回溯': {
    locate: '画递归树，检查 path 添加和撤销是否成对出现，剪枝是否误删合法分支。',
    fix: '严格套模板：处理节点 → 递归 → 撤销选择；每层 for 循环只负责当前层选择。',
    retest: '用空选择、重复元素、最小规模、需要剪枝的样例验证。',
  },
  '动态规划': {
    locate: '写出 dp 含义、初始化、转移顺序，用小样例手算前几个状态。',
    fix: '先保证状态定义能回答题目，再检查转移依赖是否已经被计算过。',
    retest: '用长度 0/1、刚好转折点、最大/最小边界样例验证。',
  },
  '多维动态规划': {
    locate: '画二维表，标出当前格依赖上、左、左上还是上一层状态。',
    fix: '初始化第一行/第一列，再按依赖方向遍历；空间压缩时倒序/正序要重新确认。',
    retest: '用空串、单字符、完全匹配、完全不匹配样例验证。',
  },
  '二分查找': {
    locate: '写清楚搜索区间是闭区间还是左闭右开，检查 mid 是否能被排除。',
    fix: '保持区间定义一致；left/right 每次都要缩小，避免 left=mid 的死循环。',
    retest: '用目标在两端、不存在、只有一个元素、两个元素的样例验证。',
  },
  '栈': {
    locate: '逐项写出入栈、出栈时机，检查栈里保存的是值、下标还是状态。',
    fix: '明确栈的单调性或匹配含义；出栈时就结算答案，没出栈的留到后面处理。',
    retest: '用递增、递减、重复值、空栈弹出的边界验证。',
  },
  '堆': {
    locate: '检查堆里元素的排序 key、堆大小和弹出条件。',
    fix: 'Python3.9 默认小根堆；需要大根堆就存负数或反向 key，堆大小要及时裁剪。',
    retest: '用 k=1、k=n、重复值、负数样例验证。',
  },
  '图论': {
    locate: '检查 visited 什么时候标记，邻居是否合法，队列/递归是否会重复访问。',
    fix: '入队/进入递归时立刻标记 visited，边界判断放在访问前。',
    retest: '用孤立点、环、多个连通块、空图/空网格样例验证。',
  },
  '矩阵': {
    locate: '把行列边界写成 m/n，检查 i/j 是否写反、边界是否越界。',
    fix: '统一使用 0 <= i < m、0 <= j < n；方向数组和访问标记同步更新。',
    retest: '用 1x1、单行、单列、非方阵样例验证。',
  },
  '贪心': {
    locate: '找一个反例尝试推翻当前选择，确认局部最优不会影响后续可行性。',
    fix: '如果局部选择会影响未来状态，就要改成排序后贪心或动态规划。',
    retest: '用边界顺序、相同值、极端值和反例样例验证。',
  },
  '前缀树': {
    locate: '逐字符跟踪当前节点，检查 children、isEnd、返回条件是否对应题意。',
    fix: 'insert 负责建节点，search 必须要求 isEnd，startsWith 只要求路径存在。',
    retest: '用完整单词、只有前缀、公共前缀、空前缀样例验证。',
  },
  '普通数组': {
    locate: '把数组下标、当前位置答案、全局答案写成表，先找下标越界或更新顺序错误。',
    fix: '明确遍历方向和答案更新时机；需要原地修改时先保存会被覆盖的信息。',
    retest: '用空数组、单元素、全相同、严格递增/递减样例验证。',
  },
  '子串': {
    locate: '写出子串起点、终点和当前统计，检查是否把子序列/子数组概念混淆。',
    fix: '子串必须连续；通常用窗口、前缀和或 DP 维护连续区间状态。',
    retest: '用空串、单字符、重复字符、答案在开头/结尾样例验证。',
  },
  '技巧': {
    locate: '先判断这题的关键技巧是位运算、数学规律还是原地标记，别急着套通用模板。',
    fix: '把技巧背后的不变量说出来，再写代码；看不出不变量就退回暴力解找规律。',
    retest: '用最小规模、重复值、负数/零、极端边界样例验证。',
  },
};

function getDebugRecipe(category: string): DebugRecipe {
  return categoryDebugRecipes[category] ?? {
    locate: '把关键变量按循环轮次列成表，先找第一次和预期不一致的位置。',
    fix: '回到题目本质和不变量，修正变量含义、更新顺序、终止条件。',
    retest: '至少用普通样例、最小边界、极端边界各跑一遍。',
  };
}

function getPracticeChecklist(problem: Problem, edgeCaseInput?: string) {
  const base = [
    '不看答案，重新说一遍题目输入、输出、限制条件。',
    '写出暴力解，再明确它慢在哪里。',
    `用「${problem.category}」方法重新手写一遍，变量名和循环条件不要照抄。`,
    edgeCaseInput ? `用 ${edgeCaseInput} 手动跑变量变化，确认输出正确。` : '挑一个边界样例手动跑变量变化，确认输出正确。',
    '说出时间复杂度、空间复杂度，以及它们分别来自哪一段代码。',
  ];

  if (problem.difficulty !== '简单') {
    base.push('隔 24 小时后再手撕一次；中等/困难题一次写对不代表真正掌握。');
  }

  return base;
}

export default function PostSolveCoach({ problem }: PostSolveCoachProps) {
  const refinement = getProblemRefinement(problem.leetcodeId);
  const recipe = getDebugRecipe(problem.category);
  const edgeCases = refinement?.edgeCases ?? [];
  const pitfalls = refinement?.commonPitfalls ?? problem.commonMistakes;
  const checklist = useMemo(() => getPracticeChecklist(problem, edgeCases[0]?.input), [problem, edgeCases]);
  const { progress, updatePostSolveCheck } = useProgress();
  const checked = progress?.postSolveChecks?.[problem.id] ?? {};

  const toggleCheck = (index: number) => {
    updatePostSolveCheck(problem.id, index, !checked[index]);
  };

  const doneCount = checklist.filter((_, index) => checked[index]).length;

  return (
    <section className="study-card post-solve-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-emerald-50 px-6 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="section-emoji">🧩</span>
              <h2 className="font-bold text-slate-950">写完题后的解决闭环</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              题不是写完就结束：要会自测、会定位错误、会复盘迁移，面试手撕才稳。
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
            已完成 {doneCount}/{checklist.length}
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <CoachMiniCard title="1. 手动跑样例" icon="✍️">
            先不要直接提交。拿一个普通样例和一个边界样例，在纸上写出关键变量每一轮怎么变。
          </CoachMiniCard>
          <CoachMiniCard title="2. 错了先定位" icon="🔧">
            不要靠猜改代码。先打印或手推第一次出错的位置，再回到变量含义和更新顺序。
          </CoachMiniCard>
          <CoachMiniCard title="3. 复盘再标完成" icon="🎤">
            能在 2 分钟内讲清暴力、瓶颈、优化、复杂度，再去右侧标记完成。
          </CoachMiniCard>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-base font-bold text-slate-950">
            <span>✅</span>
            <span>提交前自测清单</span>
          </div>
          <div className="grid gap-2">
            {checklist.map((item, index) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleCheck(index)}
                className={`flex items-start gap-3 rounded-2xl border bg-white p-3 text-left transition hover:border-emerald-300 ${
                  checked[index] ? 'border-emerald-200 text-emerald-900' : 'border-slate-200 text-slate-700'
                }`}
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${checked[index] ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {checked[index] ? '✓' : index + 1}
                </span>
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-base font-bold text-blue-950">
              <span>🧪</span>
              <span>这题至少跑这些用例</span>
            </div>
            <div className="grid gap-3">
              {edgeCases.slice(0, 3).map((edgeCase, index) => (
                <div key={`${edgeCase.input}-${index}`} className="rounded-2xl bg-white p-3 text-sm leading-6 text-slate-700 ring-1 ring-blue-100">
                  <div className="font-bold text-blue-950">用例 {index + 1}</div>
                  <div className="mt-1"><span className="font-bold">输入：</span><code>{edgeCase.input}</code></div>
                  <div><span className="font-bold">期望：</span><code>{edgeCase.expected}</code></div>
                  <div className="mt-1 text-slate-500">{edgeCase.why}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-base font-bold text-amber-950">
              <span>🚑</span>
              <span>错了怎么修，不是只告诉你"错了"</span>
            </div>
            <div className="grid gap-3">
              {pitfalls.slice(0, 3).map((pitfall, index) => (
                <div key={`${pitfall}-${index}`} className="rounded-2xl bg-white p-3 text-sm leading-6 text-slate-700 ring-1 ring-amber-100">
                  <div className="font-bold text-amber-950">常见问题：{pitfall}</div>
                  <div className="mt-2"><span className="font-bold">定位：</span>{recipe.locate}</div>
                  <div><span className="font-bold">修正：</span>{recipe.fix}</div>
                  <div><span className="font-bold">再测：</span>{recipe.retest}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CoachMiniCard({ title, icon, children }: { title: string; icon: string; children: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-base font-bold text-slate-950">
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <p className="text-sm leading-7 text-slate-600">{children}</p>
    </div>
  );
}
