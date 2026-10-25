'use client';

import Link from 'next/link';
import AppShell from '@/components/AppShell';
import GuidedStepCard from '@/components/GuidedStepCard';
import MethodologyCard from '@/components/MethodologyCard';
import NoteEditor from '@/components/NoteEditor';
import ProblemVideoPlayer from '@/components/ProblemVideoPlayer';
import SolutionWalkthrough from '@/components/SolutionWalkthrough';
import PostSolveCoach from '@/components/PostSolveCoach';
import StudySidebar from '@/components/StudySidebar';
import { useProgress } from '@/hooks/useProgress';
import { categoryIcons, difficultyConfig } from '@/lib/constants';
import type { LearningStage, Problem } from '@/types';

interface ProblemClientProps {
  problem: Problem;
  stage: LearningStage | undefined;
  previousProblemSlug: string | null;
  nextProblemSlug: string | null;
}

export default function ProblemClient({ problem, stage, previousProblemSlug, nextProblemSlug }: ProblemClientProps) {
  const { progress, toggleComplete, toggleWrongBook } = useProgress();
  const isCompleted = progress?.completedProblemIds.includes(problem.id) ?? false;
  const isInWrongBook = progress?.wrongProblemIds.includes(problem.id) ?? false;
  const diff = difficultyConfig[problem.difficulty] || difficultyConfig['简单'];
  const icon = categoryIcons[problem.category] || '💡';

  return (
    <AppShell>
      <div className="problem-page problem-layout">
        <main className="problem-main">
          <section className="problem-title-panel">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Link href="/learn" className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500 transition hover:bg-slate-200">← 学习路线</Link>
              {stage && <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 ring-1 ring-blue-100">{stage.name}</span>}
              <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${diff.bg} ${diff.text} ${diff.border}`}>{problem.difficulty}</span>
              {isCompleted && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">已完成</span>}
            </div>

            <div className="flex flex-col gap-5 md:flex-row md:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-3xl ring-1 ring-blue-100">{icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-slate-400">LeetCode #{problem.leetcodeId}</div>
                <h1 className="mt-2 text-slate-950">{problem.title}</h1>
                <p className="mt-2 text-base text-slate-500">{problem.titleEn}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">题型：{problem.category}</span>
                  {problem.tags.map((tag) => (
                    <span key={tag} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="study-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h2 className="font-black text-slate-950">学习目标</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.5fr)]">
              <div className="readable-box rounded-2xl bg-blue-50 p-4 text-sm leading-7 text-blue-950 ring-1 ring-blue-100">
                {problem.learningGoal}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="mb-2 text-xs font-black text-slate-400">前置知识</div>
                <div className="flex flex-wrap gap-2">
                  {problem.prerequisites.map((item) => (
                    <span key={item} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <ProblemVideoPlayer problem={problem} />
          <GuidedStepCard problem={problem} />
          <MethodologyCard problem={problem} />
          <SolutionWalkthrough problem={problem} />
          <PostSolveCoach problem={problem} />

          <section className="study-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <NoteEditor problemId={problem.id} />
          </section>
        </main>

        <aside className="problem-aside">
          <StudySidebar
            problem={problem}
            stage={stage}
            isCompleted={isCompleted}
            isInWrongBook={isInWrongBook}
            onToggleComplete={() => toggleComplete(problem.id)}
            onToggleWrongBook={() => toggleWrongBook(problem.id, '需要复盘：请补充具体错误原因')}
            previousProblemSlug={previousProblemSlug}
            nextProblemSlug={nextProblemSlug}
          />
        </aside>
      </div>
    </AppShell>
  );
}
