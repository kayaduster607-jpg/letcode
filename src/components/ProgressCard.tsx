'use client';

interface ProgressCardProps {
  completed: number;
  total: number;
  label?: string;
}

export default function ProgressCard({ completed, total, label = 'Hot100 总进度' }: ProgressCardProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="progress-card-readable rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-base font-black text-slate-950">{label}</span>
          <p className="mt-1 text-sm text-slate-500">完成后会同步更新首页、路线和错题复盘状态。</p>
        </div>
        <span className="text-sm font-bold text-slate-500">
          {completed}/{total} 已完成 · {percent}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
