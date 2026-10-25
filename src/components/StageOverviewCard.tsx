'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { LearningStage, Problem } from '@/types';

interface StageOverviewCardProps {
  stages: LearningStage[];
  problems: Problem[];
  completedIds: number[];
}

export default function StageOverviewCard({ stages, problems, completedIds }: StageOverviewCardProps) {
  const stageProblemMap = useMemo(() => {
    const map = new Map<string, Problem[]>();
    for (const stage of stages) {
      map.set(stage.id, problems.filter((p) => stage.problemIds.includes(p.id)));
    }
    return map;
  }, [stages, problems]);

  return (
    <section className="stage-section">
      <div className="section-head">
        <div>
          <h2 className="section-title">学习路径</h2>
          <p className="section-desc">按题型组织，不是机械刷题；灰色模块表示后续可继续补题扩展。</p>
        </div>
        <Link href="/learn" className="section-link">查看全部 →</Link>
      </div>

      <div className="stage-grid">
        {stages.map((stage) => {
          const stageProblems = stageProblemMap.get(stage.id) || [];
          const completedCount = stageProblems.filter((p) => completedIds.includes(p.id)).length;
          const total = stageProblems.length;
          const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
          const isAvailable = total > 0;
          const representativeProblem = stageProblems.find((p) => !completedIds.includes(p.id)) || stageProblems[0];

          return (
            <Link
              key={stage.id}
              href={representativeProblem ? `/problem/${representativeProblem.slug}` : '/learn'}
              className={`stage-card ${isAvailable ? '' : 'disabled'}`}
            >
              <div className="stage-top">
                <div className="stage-index">{stage.order}</div>
                <div className="stage-status">{isAvailable ? `${completedCount}/${total}` : '待补题'}</div>
              </div>
              <h3 className="stage-name">{stage.name}</h3>
              <p className="stage-desc line-clamp-2">{stage.description}</p>
              <div className="stage-tags">
                {stage.templates.slice(0, 2).map((template) => (
                  <span key={template} className="stage-tag">{template}</span>
                ))}
              </div>
              {isAvailable ? (
                <>
                  <div className="stage-progress"><span style={{ width: `${percent}%` }} /></div>
                  <div className="stage-action">进入该模式训练 →</div>
                </>
              ) : (
                <div className="stage-action" style={{ color: '#94a3b8' }}>已保留路线结构，可继续添加题目</div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
