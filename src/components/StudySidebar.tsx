'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Problem, LearningStage } from '@/types';
import { difficultyConfig } from '@/lib/constants';

interface StudySidebarProps {
  problem: Problem;
  stage: LearningStage | undefined;
  isCompleted: boolean;
  isInWrongBook: boolean;
  onToggleComplete: () => void;
  onToggleWrongBook: () => void;
  previousProblemSlug: string | null;
  nextProblemSlug: string | null;
}

export default function StudySidebar({
  problem,
  stage,
  isCompleted,
  isInWrongBook,
  onToggleComplete,
  onToggleWrongBook,
  previousProblemSlug,
  nextProblemSlug,
}: StudySidebarProps) {
  const diff = difficultyConfig[problem.difficulty] || difficultyConfig['简单'];

  return (
    <div className="space-y-4 xl:sticky xl:top-24">
      <div className="study-sidebar-card rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">当前学习</div>
        <div className="text-lg font-black leading-snug text-slate-950">{problem.title}</div>
        <div className="mt-1 text-sm text-slate-500">#{problem.leetcodeId} · {problem.titleEn}</div>
        {stage && <div className="mt-3 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 ring-1 ring-blue-100">📁 {stage.name}</div>}
      </div>

      <div className="study-sidebar-card rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 text-sm font-black text-slate-950">题目信息</div>
        <div className="space-y-3">
          <InfoRow label="难度">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${diff.bg} ${diff.text} ${diff.border}`}>{problem.difficulty}</span>
          </InfoRow>
          <InfoRow label="题型"><span className="font-bold text-slate-900">{problem.category}</span></InfoRow>
          <InfoRow label="状态"><span className={isCompleted ? 'font-bold text-emerald-600' : 'font-bold text-slate-400'}>{isCompleted ? '已完成' : '未完成'}</span></InfoRow>
          <InfoRow label="错题"><span className={isInWrongBook ? 'font-bold text-amber-600' : 'font-bold text-slate-400'}>{isInWrongBook ? '已加入' : '未加入'}</span></InfoRow>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onToggleComplete}
          className={`w-full rounded-2xl py-3 text-sm font-black transition-all ${
            isCompleted
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
          }`}
        >
          {isCompleted ? '✓ 已完成，点击取消' : '✓ 标记完成'}
        </button>

        <button
          onClick={onToggleWrongBook}
          className={`w-full rounded-2xl py-3 text-sm font-bold transition-all ${
            isInWrongBook
              ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          {isInWrongBook ? '📌 已加入错题本，点击移出' : '加入错题本'}
        </button>
      </div>

      <div className="study-sidebar-card study-sidebar-nav rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
        <Link href="/learn" className="flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
          ← 返回学习路线
        </Link>
        {(previousProblemSlug || nextProblemSlug) && (
          <div className={`mt-2 grid gap-2 ${previousProblemSlug && nextProblemSlug ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {previousProblemSlug && (
              <Link href={`/problem/${previousProblemSlug}`} className="flex w-full items-center justify-center rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100">
                ← 上一题
              </Link>
            )}
            {nextProblemSlug && (
              <Link href={`/problem/${nextProblemSlug}`} className="flex w-full items-center justify-center rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100">
                下一题 →
              </Link>
            )}
          </div>
        )}
      </div>

      <a
        href={problem.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
      >
        🔗 在 LeetCode 上查看原题
      </a>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
