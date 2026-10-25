import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function ProblemNotFound() {
  return (
    <AppShell>
      <div className="content-page">
        <section className="page-hero-card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">🔍</div>
          <h1 className="text-3xl font-black text-slate-950">没有找到这道题</h1>
          <p className="page-copy mx-auto mt-3 max-w-xl text-slate-500">当前链接对应的题目不存在，可能是地址拼写错误，或者这道题还没有加入 Hot100 学习路线。</p>
          <Link href="/learn" className="primary-btn mx-auto mt-6 inline-flex max-w-xs">返回学习路线</Link>
        </section>
      </div>
    </AppShell>
  );
}
