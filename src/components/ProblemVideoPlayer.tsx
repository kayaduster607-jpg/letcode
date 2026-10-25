'use client';

import type { Problem } from '@/types';

interface ProblemVideoPlayerProps {
  problem: Problem;
}

export default function ProblemVideoPlayer({ problem }: ProblemVideoPlayerProps) {
  const videoUrl = `/api/video-presentations/${problem.slug}/presentation/index.html`;

  return (
    <section id="video-explanation" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="bg-slate-950 px-6 py-6 text-white">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Video Walkthrough</div>
          <h2 className="mt-3 text-2xl font-black leading-tight">图形动画讲解</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            这一块会直接读取当前题目的动画成片。点击画面或使用播放器按钮推进，每一幕都配有对应口播。
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
              <div className="text-xs text-slate-400">题号</div>
              <div className="mt-1 font-black">LeetCode {problem.leetcodeId}</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
              <div className="text-xs text-slate-400">题型</div>
              <div className="mt-1 truncate font-black">{problem.category}</div>
            </div>
          </div>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-cyan-300/40 px-4 text-sm font-black text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10"
          >
            独立窗口打开
          </a>
        </div>

        <div className="bg-slate-900 p-4">
          <div className="aspect-video overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-inner">
            <iframe
              title={`${problem.title} 图形动画讲解`}
              src={videoUrl}
              className="h-full w-full"
              loading="lazy"
              allow="autoplay"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
