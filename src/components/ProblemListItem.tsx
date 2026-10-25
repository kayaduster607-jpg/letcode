'use client';

import Link from 'next/link';
import { Problem } from '@/types';
import { difficultyConfig } from '@/lib/constants';

interface ProblemListItemProps {
  problem: Problem;
  isCompleted: boolean;
  isInWrongBook: boolean;
}

export default function ProblemListItem({ problem, isCompleted, isInWrongBook }: ProblemListItemProps) {
  const diff = difficultyConfig[problem.difficulty] || difficultyConfig['简单'];

  return (
    <Link
      href={`/problem/${problem.slug}`}
      className="problem-list-item group flex flex-col gap-3 rounded-2xl p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${isCompleted ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'}`}>
          {isCompleted ? '✓' : problem.order}
        </span>
        <div className="min-w-0">
          <div className="truncate text-base font-black text-slate-950 transition group-hover:text-blue-700">
            {problem.title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>#{problem.leetcodeId}</span>
            <span>{problem.titleEn}</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 pl-11 sm:pl-0">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${diff.bg} ${diff.text} ${diff.border}`}>{problem.difficulty}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{problem.category}</span>
        {isInWrongBook && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-100">错题</span>}
        <span className="text-sm font-bold text-slate-300 transition group-hover:text-blue-600">→</span>
      </div>
    </Link>
  );
}
