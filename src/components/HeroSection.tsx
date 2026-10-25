'use client';

interface HeroSectionProps {
  studyDays: number;
  currentStage: string;
  completedCount: number;
  totalCount: number;
}

export default function HeroSection({ studyDays, currentStage, completedCount, totalCount }: HeroSectionProps) {
  const safeTotal = Math.max(totalCount, 1);
  const percent = Math.round((completedCount / safeTotal) * 100);

  return (
    <section className="home-hero">
      <div className="hero-layout">
        <div>
          <div className="hero-kicker">
            <span className="hero-kicker-dot" />
            今天的目标：先吃透 1 个解题模式
          </div>
          <h1 className="hero-title">先建立解题路径，再开始刷题</h1>
          <p className="hero-desc">
            按「读题 → 暴力 → 瓶颈 → 模式 → 优化 → 复盘」推进。不是背答案，而是把每道题沉淀成下次能迁移的方法。
          </p>
        </div>

        <div className="hero-metrics">
          <Metric value={studyDays} label="学习天数" />
          <Metric value={`${completedCount}/${totalCount}`} label="完成题目" />
          <Metric value={`${percent}%`} label="总进度" />
          <div className="hero-progress-card">
            <div className="hero-progress-top">
              <span>当前阶段</span>
              <span>{currentStage || '待开始'}</span>
            </div>
            <div className="hero-progress-track">
              <div className="hero-progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="metric-card">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}
