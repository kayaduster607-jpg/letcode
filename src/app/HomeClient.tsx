'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import HeroSection from '@/components/HeroSection';
import TodayLearningCard from '@/components/TodayLearningCard';
import StageOverviewCard from '@/components/StageOverviewCard';
import { problems } from '@/data/problems';
import { getOrderedProblemIds, learningPath } from '@/data/learningPath';
import { useProgress } from '@/hooks/useProgress';
import { Problem } from '@/types';

export default function Home() {
  const { progress } = useProgress();

  const recommendProblem: Problem | null = useMemo(() => {
    if (!progress) return null;
    const completedIds = new Set(progress.completedProblemIds);
    const nextProblemId = getOrderedProblemIds().find((problemId) => !completedIds.has(problemId));
    return nextProblemId ? problems.find((p) => p.id === nextProblemId) || null : null;
  }, [progress]);

  const weakest = useMemo(() => {
    if (!progress) return { name: '', description: '', completed: 0, total: 0, rate: 1 };
    return learningPath
      .filter((s) => s.problemIds.length > 0)
      .map((stage) => {
        const stageProblems = problems.filter((p) => stage.problemIds.includes(p.id));
        const completed = stageProblems.filter((p) => progress.completedProblemIds.includes(p.id)).length;
        return {
          name: stage.name,
          description: stage.description,
          completed,
          total: stageProblems.length,
          rate: stageProblems.length > 0 ? completed / stageProblems.length : 1,
        };
      })
      .reduce((min, current) => (current.rate < min.rate ? current : min), { name: '', description: '', completed: 0, total: 0, rate: 1 });
  }, [progress]);

  if (!progress) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-6">
          <div className="h-56 rounded-[2rem] bg-gradient-to-r from-blue-100 to-indigo-100" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-28 rounded-3xl bg-slate-100" />
            <div className="h-28 rounded-3xl bg-slate-100" />
            <div className="h-28 rounded-3xl bg-slate-100" />
          </div>
          <div className="h-80 rounded-[1.75rem] border border-slate-200 bg-white" />
        </div>
      </AppShell>
    );
  }

  const currentStage = recommendProblem
    ? learningPath.find((s) => s.problemIds.includes(recommendProblem.id))?.name || ''
    : '全部完成';

  const completedCount = progress.completedProblemIds.length;
  const wrongCount = progress.wrongProblemIds.length;
  const unlockedHints = Object.values(progress.unlockedHints).reduce((sum, level) => sum + level, 0);
  const total = problems.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const availableStages = learningPath.filter((stage) => stage.problemIds.length > 0).length;
  const completedStages = learningPath.filter((stage) => {
    if (stage.problemIds.length === 0) return false;
    return stage.problemIds.every((id) => progress.completedProblemIds.includes(id));
  }).length;

  const sidebar = (
    <div className="side-stack">
      <div className="side-card">
        <h3 className="side-title">学习概览</h3>
        <div className="overview-row">
          <div className="ring-wrap">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="7" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#2563eb"
                strokeWidth="7"
                strokeDasharray={`${percent * 2.136} 214`}
                strokeLinecap="round"
              />
            </svg>
            <div className="ring-center">{percent}%</div>
          </div>
          <div>
            <div className="overview-num">{completedCount}<span>/{total}</span></div>
            <div className="overview-label">题目已完成</div>
          </div>
        </div>
        <div className="mini-grid">
          <MiniStat label="学习天数" value={progress.studyDays} icon="📅" />
          <MiniStat label="错题数" value={wrongCount} icon="📌" />
          <MiniStat label="解锁提示" value={unlockedHints} icon="💡" />
          <MiniStat label="完成阶段" value={`${completedStages}/${availableStages}`} icon="🧩" />
        </div>
      </div>

      <div className="side-card">
        <h3 className="side-title">快捷入口</h3>
        <div>
          <QuickLink href="/learn" icon="📚" title="学习路线" desc="查看题型与题目列表" />
          <QuickLink href="/wrong-book" icon="📝" title="错题本" desc="复盘薄弱环节" />
        </div>
      </div>

      {weakest.total > 0 && weakest.rate < 1 && (
        <div className="side-card advice-card">
          <div className="advice-title">💬 学习建议</div>
          <p className="advice-text">
            当前建议先完成「{weakest.name}」。这一阶段只要吃透「{recommendProblem?.title || '下一题'}」，就能建立一个可复用的解题模板。
          </p>
        </div>
      )}
    </div>
  );

  return (
    <AppShell sidebar={sidebar}>
      <div className="home-stack">
        <HeroSection studyDays={progress.studyDays} currentStage={currentStage} completedCount={completedCount} totalCount={total} />

        <div className="home-dashboard">
          <DashboardCard label="下一题" value={recommendProblem?.title || '已完成'} desc={recommendProblem ? `题型：${recommendProblem.category}` : '去错题本复盘'} />
          <DashboardCard label="当前阶段" value={currentStage || '待开始'} desc="根据未完成题自动推荐" />
          <DashboardCard label="提示使用" value={`${unlockedHints} 次`} desc="提示越少，独立解题能力越强" />
        </div>

        <TodayLearningCard problem={recommendProblem} stageName={currentStage} />

        <StageOverviewCard stages={learningPath} problems={problems} completedIds={progress.completedProblemIds} />
      </div>
    </AppShell>
  );
}

function DashboardCard({ label, value, desc }: { label: string; value: string; desc: string }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-label">{label}</div>
      <div className="dashboard-value one-line">{value}</div>
      <div className="dashboard-desc">{desc}</div>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="mini-stat">
      <div className="mini-label">{icon} {label}</div>
      <div className="mini-value">{value}</div>
    </div>
  );
}

function QuickLink({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <Link href={href} className="quick-link">
      <div className="quick-icon">{icon}</div>
      <div className="min-w-0">
        <div className="quick-title">{title}</div>
        <div className="quick-desc">{desc}</div>
      </div>
    </Link>
  );
}
