'use client';

import Link from 'next/link';
import { Problem } from '@/types';
import { categoryIcons } from '@/lib/constants';

interface TodayLearningCardProps {
  problem: Problem | null;
  stageName: string;
}

export default function TodayLearningCard({ problem, stageName }: TodayLearningCardProps) {
  if (!problem) {
    return (
      <div className="empty-card">
        <div className="empty-icon">🎉</div>
        <h3 className="empty-title">太棒了，当前题目已全部完成</h3>
        <p className="empty-desc">可以去错题本复盘，也可以继续补充新的 Hot100 题目数据。</p>
        <Link href="/wrong-book" className="primary-btn" style={{ marginTop: 18, display: 'inline-flex', flex: 'initial' }}>
          查看错题本
        </Link>
      </div>
    );
  }

  const learningSteps = getLearningSteps(problem);

  return (
    <section className="today-card">
      <div className="today-grid">
        <div className="today-main">
          <div className="pill-row">
            <span className="pill pill-blue">今日学习任务</span>
            <span className={`pill ${difficultyClass(problem.difficulty)}`}>{problem.difficulty}</span>
            <span className="pill pill-gray">预计 30-45 min</span>
          </div>

          <div className="problem-head">
            <div className="problem-icon">{getCategoryIcon(problem.category)}</div>
            <div className="min-w-0">
              <h2 className="problem-title">{problem.title}</h2>
              <p className="problem-en">{problem.titleEn}</p>
              <div className="tag-row">
                <span className="tag">📁 {stageName}</span>
                <span className="tag">🏷️ {problem.category}</span>
                {problem.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="goal-box">
            <div className="goal-title">今日学习目标</div>
            <p className="goal-text">{problem.learningGoal}</p>
          </div>
        </div>

        <div className="today-steps">
          <div className="step-titlebar">
            <h3 className="step-title">学习步骤</h3>
            <span className="step-subtitle">6 步闭环</span>
          </div>
          <div className="steps-list">
            {learningSteps.map((step, idx) => (
              <div key={idx} className="step-item">
                <div className="step-num">{idx + 1}</div>
                <div>
                  <div className="step-name">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="today-actions">
        <Link href={`/problem/${problem.slug}`} className="primary-btn">开始学习 →</Link>
        <Link href="/learn" className="secondary-btn">查看路线</Link>
      </div>
    </section>
  );
}

function difficultyClass(difficulty: string): string {
  if (difficulty === '中等') return 'pill-amber';
  if (difficulty === '困难') return 'pill-red';
  return 'pill-green';
}

function getCategoryIcon(category: string): string {
  return categoryIcons[category] || '💡';
}

function getLearningSteps(problem: Problem): { title: string; desc: string }[] {
  if (problem.category === '动态规划') {
    return [
      { title: '定义状态', desc: '明确 dp[i] 到底代表什么' },
      { title: '写递推式', desc: '找出当前状态依赖哪些历史状态' },
      { title: '初始化', desc: '确定递推起点和边界条件' },
      { title: '定顺序', desc: '保证依赖值先被计算出来' },
      { title: '手推验证', desc: '用小样例验证公式是否正确' },
      { title: '代码复盘', desc: '对照复杂度和边界情况' },
    ];
  }

  return [
    { title: '读题建模', desc: '把输入、输出和限制条件说清楚' },
    { title: '先写暴力', desc: '从最直觉的方法开始，不跳步' },
    { title: '定位瓶颈', desc: '找重复计算或低效查找的位置' },
    { title: '识别模式', desc: `判断为什么适合用「${problem.category}」` },
    { title: '写出优化', desc: '套入模板，但保留题目自己的细节' },
    { title: '复盘迁移', desc: '总结这类题下次怎么识别' },
  ];
}
