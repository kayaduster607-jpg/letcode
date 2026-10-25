'use client';

import { useMemo, useState } from 'react';
import { Problem } from '@/types';
import { getProblemRefinement } from '@/data/problemRefinements';
import { useHints } from '@/hooks/useHints';
import CodeBlock from './CodeBlock';

interface GuidedStepCardProps {
  problem: Problem;
}

type DifficultyKey = 'easy' | 'medium' | 'hard';

interface Step {
  num: number;
  title: string;
  question: string;
  answerTitle: string;
  content: string;
  code?: string;
}

function getDifficultyKey(difficulty: string): DifficultyKey {
  if (difficulty.includes('简单')) return 'easy';
  if (difficulty.includes('困难')) return 'hard';
  return 'medium';
}

function getDifficultyLabel(difficulty: string) {
  const key = getDifficultyKey(difficulty);
  if (key === 'easy') return '基础题';
  if (key === 'hard') return '困难题';
  return '进阶题';
}

function getPseudoCode(problem: Problem, handwriteSteps?: string[]) {
  if (handwriteSteps?.length) {
    return handwriteSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');
  }
  return problem.pseudocode.includes('参考 level6') ? problem.hints.level5 : problem.pseudocode;
}

function makeStepRange(level: number) {
  return Array.from({ length: Math.max(0, Math.min(6, level)) }, (_, index) => index + 1);
}

function buildEasySteps(problem: Problem, coreIdea: string, flow: string, code: string): Step[] {
  return [
    {
      num: 1,
      title: '快速读题：确认输入、输出和限制',
      question: '这题真正要我们返回什么？有没有空数组、重复值、单节点这类边界？',
      answerTitle: '下面的参考理解',
      content: `${problem.summary}\n\n${problem.hints.level1}`,
    },
    {
      num: 2,
      title: '直接抓手：先找到最自然的做法',
      question: '如果先不考虑极限性能，怎样写最容易保证正确？',
      answerTitle: '下面的参考理解',
      content: problem.bruteForceIdea || problem.hints.level3,
    },
    {
      num: 3,
      title: '关键边界：把容易漏的情况提前写出来',
      question: '这题最容易错在哪里？更新顺序、空输入、重复元素还是下标范围？',
      answerTitle: '下面的参考理解',
      content: `${problem.hints.level2}\n\n${problem.commonMistakes.join('\n')}`,
    },
    {
      num: 4,
      title: `模式归纳：为什么用${problem.category}`,
      question: `这题和${problem.category}有什么稳定关系？下次看到什么信号可以想到它？`,
      answerTitle: '下面的参考理解',
      content: `${problem.whyThisPattern}\n\n${coreIdea}`,
    },
    {
      num: 5,
      title: '落到流程：变量、循环和返回值',
      question: '真正写代码前，先把变量含义和更新顺序排清楚。',
      answerTitle: '下面的参考理解',
      content: flow,
    },
    {
      num: 6,
      title: 'Python3.9 参考实现：对照流程复盘',
      question: '每一行代码对应前面哪一步？边界条件在哪里被处理？',
      answerTitle: 'Python3.9 参考代码',
      content: '下面是本题的参考实现。建议先自己写一遍，再对照变量定义、更新顺序、终止条件和边界处理。',
      code,
    },
  ];
}

function buildMediumSteps(problem: Problem, coreIdea: string, flow: string, code: string): Step[] {
  return [
    {
      num: 1,
      title: '读题建模：把题目翻译成可操作目标',
      question: '输入是什么？输出是什么？限制条件里有没有决定做法的关键词？',
      answerTitle: '下面的参考理解',
      content: `${problem.summary}\n\n核心抓手：${coreIdea}\n\n${problem.hints.level1}`,
    },
    {
      num: 2,
      title: '暴力起步：先保证答案一定正确',
      question: '最直接的枚举或模拟是什么？它为什么能得到正确答案？',
      answerTitle: '下面的参考理解',
      content: problem.bruteForceIdea || problem.hints.level3,
    },
    {
      num: 3,
      title: '定位瓶颈：找出重复计算或重复搜索',
      question: '暴力做法慢在哪里？是重复查找、重复枚举，还是状态被反复计算？',
      answerTitle: '下面的参考理解',
      content: `${problem.hints.level2}\n\n${problem.whyThisPattern}`,
    },
    {
      num: 4,
      title: `识别模式：切到${problem.category}视角`,
      question: `看到哪些结构时，应该把这题归到${problem.category}？`,
      answerTitle: '下面的参考理解',
      content: `${problem.hints.level4}\n\n${problem.optimizedIdea}`,
    },
    {
      num: 5,
      title: '手写流程：先写伪代码，再写正式代码',
      question: '变量分别表示什么？循环条件是什么？更新顺序有没有先后要求？',
      answerTitle: '下面的参考理解',
      content: flow,
    },
    {
      num: 6,
      title: 'Python3.9 参考实现：锁定面试写法',
      question: '复杂度来自哪里？有没有可以在面试里主动说明的边界？',
      answerTitle: 'Python3.9 参考代码',
      content: '下面是逐题整理后的参考实现。重点看变量含义、循环不变量、边界判断和返回值。',
      code,
    },
  ];
}

function buildHardSteps(problem: Problem, coreIdea: string, flow: string, code: string): Step[] {
  return [
    {
      num: 1,
      title: '拆题压缩：先分清目标、状态和边界',
      question: '题目难点到底是选择太多、状态太多，还是边界条件太绕？',
      answerTitle: '下面的参考理解',
      content: `${problem.summary}\n\n核心抓手：${coreIdea}\n\n${problem.hints.level1}`,
    },
    {
      num: 2,
      title: '不可行方案：用暴力看清问题规模',
      question: '普通枚举为什么会炸？它重复探索了哪些信息？',
      answerTitle: '下面的参考理解',
      content: problem.bruteForceIdea || problem.hints.level3,
    },
    {
      num: 3,
      title: '关键结构：找到能收缩复杂度的量',
      question: '能不能用状态、单调性、哈希索引、栈、图搜索或区间关系保存中间结果？',
      answerTitle: '下面的参考理解',
      content: `${problem.hints.level2}\n\n${problem.whyThisPattern}`,
    },
    {
      num: 4,
      title: `状态/不变量：把${problem.category}写成规则`,
      question: '每一步结束时，哪些条件必须一直成立？如果是 DP，状态和转移分别是什么？',
      answerTitle: '下面的参考理解',
      content: `${problem.hints.level4}\n\n${problem.optimizedIdea}`,
    },
    {
      num: 5,
      title: '边界推演：用小样例验证更新顺序',
      question: '最小输入、重复元素、全空/全满、极值场景会不会破坏流程？',
      answerTitle: '下面的参考理解',
      content: `${flow}\n\n建议测试：\n${problem.commonMistakes.join('\n')}`,
    },
    {
      num: 6,
      title: 'Python3.9 参考实现：逐行复盘不变量',
      question: '这份代码哪里维护了核心状态？哪里处理了边界？复杂度怎样解释？',
      answerTitle: 'Python3.9 参考代码',
      content: '困难题不要只记代码形状，要把代码反向映射回状态定义、转移规则和边界处理。',
      code,
    },
  ];
}

export default function GuidedStepCard({ problem }: GuidedStepCardProps) {
  const { unlockedLevel, unlockTo } = useHints(problem.id);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const refinement = getProblemRefinement(problem.leetcodeId);

  const handleStepClick = async (level: number) => {
    const isUnlocked = level <= unlockedLevel;
    const canUnlock = level <= unlockedLevel + 1;

    if (isUnlocked) {
      setExpandedSteps((prev) => {
        const next = new Set(prev);
        if (next.has(level)) {
          next.delete(level);
        } else {
          next.add(level);
        }
        return next;
      });
      return;
    }

    if (canUnlock) {
      await unlockTo(level);
      setExpandedSteps((prev) => {
        const next = new Set(prev);
        next.add(level);
        return next;
      });
    }
  };

  const allUnlocked = unlockedLevel >= 6;
  const allExpanded = allUnlocked && makeStepRange(6).every((level) => expandedSteps.has(level));

  const handleToggleAll = async () => {
    if (allExpanded) {
      setExpandedSteps(new Set());
      return;
    }

    await unlockTo(6);
    setExpandedSteps(new Set(makeStepRange(6)));
  };

  const steps: Step[] = useMemo(() => {
    const coreIdea = refinement?.coreIdea || problem.whyThisPattern;
    const flow = getPseudoCode(problem, refinement?.handwriteSteps);
    const code = refinement?.annotatedCode || problem.solutionCode || problem.hints.level6;
    const difficulty = getDifficultyKey(problem.difficulty);

    if (difficulty === 'easy') return buildEasySteps(problem, coreIdea, flow, code);
    if (difficulty === 'hard') return buildHardSteps(problem, coreIdea, flow, code);
    return buildMediumSteps(problem, coreIdea, flow, code);
  }, [problem, refinement]);

  return (
    <div className="study-card guided-card overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="section-emoji">🎯</span>
              <h2 className="font-bold text-slate-950">{getDifficultyLabel(problem.difficulty)}学习路径</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              每题按难度调整讲解节奏；展开后直接看“下面的参考理解”，减少重复套话。
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleAll}
            className="shrink-0 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-50"
          >
            {allExpanded ? '收起全部' : '展开全部解答'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-6">
        {steps.map((step) => {
          const isUnlocked = step.num <= unlockedLevel;
          const canUnlock = step.num <= unlockedLevel + 1;
          const isExpanded = expandedSteps.has(step.num);

          const statusText = isUnlocked
            ? isExpanded
              ? '点击收起'
              : '已解锁，点击展开'
            : canUnlock
              ? '点击查看参考理解'
              : '按顺序解锁';

          return (
            <div
              key={step.num}
              className={`guided-step rounded-2xl border transition-all ${
                isUnlocked
                  ? 'border-blue-200 bg-blue-50/30'
                  : canUnlock
                    ? 'border-slate-200 bg-white hover:border-blue-300'
                    : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => canUnlock && handleStepClick(step.num)}
                disabled={!canUnlock}
                className="guided-step-button flex w-full items-start gap-4 p-4 text-left"
                aria-expanded={isExpanded}
              >
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  isUnlocked
                    ? 'bg-blue-600 text-white'
                    : canUnlock
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-slate-100 text-slate-300'
                }`}
                >
                  {isUnlocked ? (isExpanded ? '-' : '✓') : step.num}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className={`guided-step-title ${isUnlocked ? 'text-blue-950' : canUnlock ? 'text-slate-950' : 'text-slate-300'}`}>
                      {step.title}
                    </span>
                    <span className={`guided-step-status ${isUnlocked ? 'text-blue-700' : canUnlock ? 'text-slate-400' : 'text-slate-300'}`}>
                      {statusText}
                    </span>
                  </div>
                  <p className={`mt-2 ${isUnlocked ? 'text-blue-800' : canUnlock ? 'text-slate-500' : 'text-slate-300'}`}>
                    {step.question}
                  </p>
                </div>
              </button>

              {isUnlocked && isExpanded && (
                <div className="guided-step-content px-4 pb-4 pt-0 sm:ml-[52px]">
                  <div className="answer-box rounded-2xl border border-blue-100 bg-white p-4">
                    <h4 className="answer-label answer-section-title">📌 {step.answerTitle}</h4>
                    <p className="answer-body whitespace-pre-wrap">{step.content}</p>
                    {step.code && (
                      <div className="mt-4">
                        <CodeBlock code={step.code} language="Python3.9" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
