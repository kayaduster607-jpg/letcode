'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { useProgress } from '@/hooks/useProgress';
import { problems } from '@/data/problems';
import { WrongBookEntry } from '@/types';

const diffBadge: Record<string, string> = {
  '简单': 'bg-emerald-50 text-emerald-700',
  '中等': 'bg-amber-50 text-amber-700',
  '困难': 'bg-red-50 text-red-700',
};

type Filter = 'all' | 'unmastered' | 'review';

const REVIEW_INTERVAL_DAYS = 3;

function isReviewDue(entry: WrongBookEntry): boolean {
  if (entry.mastered) return false;
  if (!entry.lastReviewAt) return true;
  const lastReviewTime = new Date(entry.lastReviewAt).getTime();
  if (Number.isNaN(lastReviewTime)) return true;
  return Date.now() - lastReviewTime >= REVIEW_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
}

export default function WrongBookPage() {
  const { progress, markMastered, updateWrongBookReason } = useProgress();
  const [filter, setFilter] = useState<Filter>('all');

  if (!progress) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-xl w-1/3" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  const entries = progress.wrongBook.filter((e) => {
    if (filter === 'unmastered') return !e.mastered;
    if (filter === 'review') return isReviewDue(e);
    return true;
  });

  const handleToggleMastered = (problemId: number) => {
    markMastered(problemId);
  };

  const handleUpdateReason = (problemId: number, reason: string) => {
    updateWrongBookReason(problemId, reason);
  };

  return (
    <AppShell>
      <div className="wrong-book-page content-page">
        {/* Header */}
        <section className="page-hero-card">
          <h1 className="text-2xl font-bold text-[#0f172a]">错题本</h1>
          <p className="page-copy text-sm text-[#64748b] mt-1">
            记录错误原因，定期复习，把错题变成真正的掌握
          </p>
        </section>

        {/* Filters */}
        <div className="wrong-filter-tabs flex gap-2">
          {([
            { key: 'all', label: '全部', count: progress.wrongBook.length },
            { key: 'unmastered', label: '未掌握', count: progress.wrongBook.filter((e) => !e.mastered).length },
            { key: 'review', label: '需复习', count: progress.wrongBook.filter(isReviewDue).length },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-[#64748b] border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#cbd5e1]'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="empty-state-card bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-[#f1f5f9] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">暂无错题</h3>
            <p className="text-sm text-[#94a3b8]">
              在题目详情页点击「加入错题本」即可添加；复盘后可以标记已掌握
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const problem = problems.find((p) => p.id === entry.problemId);
              if (!problem) return null;

              return (
                <div
                  key={entry.problemId}
                  className={`wrong-card bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                    entry.mastered ? 'border-emerald-200 opacity-70' : 'border-[#e2e8f0]'
                  }`}
                >
                  <div className="wrong-card-body p-5">
                    <div className="wrong-card-top flex items-start justify-between gap-4 mb-3">
                      <div className="wrong-card-title-row flex items-center gap-3">
                        <Link
                          href={`/problem/${problem.slug}`}
                          className="font-semibold text-[#0f172a] hover:text-blue-600 transition-colors"
                        >
                          {problem.title}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffBadge[problem.difficulty]}`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569]">
                          {problem.category}
                        </span>
                        {entry.mastered && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                            已掌握
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link
                          href={`/problem/${problem.slug}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          查看题目
                        </Link>
                        <button
                          onClick={() => handleToggleMastered(entry.problemId)}
                          className={`text-xs ${
                            entry.mastered ? 'text-[#94a3b8] hover:underline' : 'text-emerald-600 hover:underline'
                          }`}
                        >
                          {entry.mastered ? '取消掌握' : '标记已掌握'}
                        </button>
                      </div>
                    </div>

                    <div className="wrong-reason-row flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={entry.reason}
                          onChange={(e) => handleUpdateReason(entry.problemId, e.target.value)}
                          placeholder="记录你的错误原因..."
                          className="w-full text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#f8fafc]"
                        />
                      </div>
                      <div className="text-xs text-[#94a3b8] whitespace-nowrap">
                        {entry.lastReviewAt
                          ? `复习: ${new Date(entry.lastReviewAt).toLocaleDateString()}`
                          : '未复习'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
