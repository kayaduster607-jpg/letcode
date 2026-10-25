'use client';

import { useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import ProgressCard from '@/components/ProgressCard';
import ProblemListItem from '@/components/ProblemListItem';
import { problems } from '@/data/problems';
import { learningPath } from '@/data/learningPath';
import { useProgress } from '@/hooks/useProgress';
import { Problem } from '@/types';

type DifficultyFilter = '全部' | '简单' | '中等' | '困难';
type StatusFilter = '全部' | '未完成' | '已完成' | '错题';

export default function LearnPage() {
  const { progress } = useProgress();
  const [keyword, setKeyword] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('全部');
  const [status, setStatus] = useState<StatusFilter>('全部');

  const categories = useMemo(() => Array.from(new Set(problems.map((p) => p.category))), []);

  const stageProblemMap = useMemo(() => {
    const map = new Map<string, Problem[]>();
    const lowerKeyword = keyword.trim().toLowerCase();

    for (const stage of learningPath) {
      const stageProblems = problems.filter((problem) => {
        if (!stage.problemIds.includes(problem.id)) return false;
        if (difficulty !== '全部' && problem.difficulty !== difficulty) return false;
        if (progress) {
          const completed = progress.completedProblemIds.includes(problem.id);
          const wrong = progress.wrongProblemIds.includes(problem.id);
          if (status === '未完成' && completed) return false;
          if (status === '已完成' && !completed) return false;
          if (status === '错题' && !wrong) return false;
        }
        if (!lowerKeyword) return true;
        return [problem.title, problem.titleEn, problem.category, String(problem.leetcodeId), ...problem.tags]
          .join(' ')
          .toLowerCase()
          .includes(lowerKeyword);
      });
      map.set(stage.id, stageProblems);
    }

    return map;
  }, [keyword, difficulty, status, progress]);

  const completedCount = progress?.completedProblemIds.length ?? 0;
  const filteredCount = Array.from(stageProblemMap.values()).reduce((sum, list) => sum + list.length, 0);

  if (!progress) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-6">
          <div className="h-24 w-full rounded-[1.5rem] bg-slate-100" />
          <div className="h-24 rounded-[1.5rem] bg-slate-100" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-[1.75rem] border border-slate-200 bg-white" />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="learn-page content-page">
        <section className="page-hero-card rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">系统路线</div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950">学习路线</h1>
              <p className="page-copy mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                按「题型 → 模板 → 代表题」推进。先吃透每个模式的核心题，再继续扩展同类题。
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:min-w-[390px]">
              <HeaderStat label="已开放题" value={problems.length} />
              <HeaderStat label="已完成" value={completedCount} />
              <HeaderStat label="题型数" value={categories.length} />
            </div>
          </div>
        </section>

        <ProgressCard completed={completedCount} total={problems.length} />

        <section className="page-filter-card rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <LearningModeCard
              icon="①"
              title="先独立思考"
              desc="进入题目后先看第 1 步读题建模，不急着展开代码。先用自己的话说清输入、输出和限制条件。"
            />
            <LearningModeCard
              icon="②"
              title="卡住再解锁"
              desc="按「暴力 → 瓶颈 → 模式 → 伪代码」逐层展开。每一步都有参考解答，不再只有问题。"
            />
            <LearningModeCard
              icon="③"
              title="最后复盘迁移"
              desc="看完整代码后，用常见错误和复盘问题检查自己是否真的掌握了这一类题。"
            />
          </div>
        </section>

        <section className="page-filter-card rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索题名、英文名、编号、标签，例如：哈希 / 206 / Two Sum"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <SegmentedControl
              value={difficulty}
              options={['全部', '简单', '中等', '困难']}
              onChange={(value) => setDifficulty(value as DifficultyFilter)}
            />
            <SegmentedControl
              value={status}
              options={['全部', '未完成', '已完成', '错题']}
              onChange={(value) => setStatus(value as StatusFilter)}
            />
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-400">当前筛选结果：{filteredCount} 题</div>
        </section>

        <div className="space-y-5">
          {learningPath.map((stage) => {
            const stageProblems = stageProblemMap.get(stage.id) || [];
            const originalProblems = problems.filter((p) => stage.problemIds.includes(p.id));
            const completedInStage = originalProblems.filter((p) => progress.completedProblemIds.includes(p.id)).length;
            const total = originalProblems.length;
            const percent = total > 0 ? Math.round((completedInStage / total) * 100) : 0;
            const isComplete = completedInStage === total && total > 0;
            const hasProblems = total > 0;
            const shouldShowStage = hasProblems || (!keyword && difficulty === '全部' && status === '全部');

            if (!shouldShowStage) return null;
            if (hasProblems && stageProblems.length === 0) return null;

            return (
              <section
                key={stage.id}
                className={`route-stage-card overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition ${
                  isComplete ? 'border-emerald-200' : hasProblems ? 'border-slate-200' : 'border-dashed border-slate-200 opacity-70'
                }`}
              >
                <div className={`p-5 sm:p-6 ${isComplete ? 'bg-emerald-50/60' : 'bg-white'}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black ${
                        isComplete
                          ? 'bg-emerald-100 text-emerald-700'
                          : hasProblems
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                            : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'
                      }`}>
                        {isComplete ? '✓' : stage.order}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-950">{stage.name}</h2>
                        <p className="page-copy mt-1 text-sm leading-6 text-slate-500">{stage.description}</p>
                      </div>
                    </div>
                    {hasProblems ? (
                      <div className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 text-right ring-1 ring-slate-100">
                        <div className="text-sm font-black text-slate-950">{completedInStage}/{total}</div>
                        <div className="text-xs text-slate-400">已完成</div>
                      </div>
                    ) : (
                      <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400">待补充题目</span>
                    )}
                  </div>

                  {hasProblems && (
                    <div className="mt-5">
                      <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${percent}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {stage.templates.map((template) => (
                          <span key={template} className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">{template}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {hasProblems ? (
                  <div className="route-problem-list border-t border-slate-100 p-3 sm:p-4">
                    {stageProblems.map((problem) => (
                      <ProblemListItem
                        key={problem.id}
                        problem={problem}
                        isCompleted={progress.completedProblemIds.includes(problem.id)}
                        isInWrongBook={progress.wrongProblemIds.includes(problem.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="route-stage-note border-t border-slate-100 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                    {stage.tips} 这个模块已在路线中预留，后续补充该题型代表题即可直接展示。
                  </div>
                )}

                {hasProblems && stage.tips && (
                  <div className="route-stage-note border-t border-slate-100 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-500">
                    <span className="font-bold text-slate-700">学习建议：</span>{stage.tips}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function LearningModeCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">{icon}</div>
      <div className="text-base font-black text-slate-950">{title}</div>
      <p className="mt-2 text-sm leading-7 text-slate-500">{desc}</p>
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="page-stat rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-100">
      <div className="text-xl font-black text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-semibold text-slate-400">{label}</div>
    </div>
  );
}

function SegmentedControl({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="segmented-control flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
            value === option ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/70 hover:text-slate-950'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
