import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function GlobalNotFound() {
  return (
    <AppShell>
      <div className="content-page">
        <section className="page-hero-card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">🔍</div>
          <h1 className="text-3xl font-black text-slate-950">页面不存在</h1>
          <p className="page-copy mx-auto mt-3 max-w-xl text-slate-500">当前地址没有对应内容。你可以回到学习路线，从 100 道 Hot100 题中继续选择。</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/learn" className="primary-btn inline-flex max-w-xs">返回学习路线</Link>
            <Link href="/" className="secondary-btn inline-flex max-w-xs">回到首页</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
