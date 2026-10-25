'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from './Navbar';
import { useAuth } from '@/contexts/AuthContext';

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
  sidebar?: ReactNode;
  requireAuth?: boolean;
}

function AuthLoadingScreen({ showNav }: { showNav: boolean }) {
  return (
    <div className="app-shell">
      {showNav && <Navbar />}
      <main className="app-main">
        <section className="app-content">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
              <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-2xl bg-blue-100" />
              <div className="text-base font-semibold text-slate-600">正在校验登录状态...</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AppShell({ children, showNav = true, sidebar, requireAuth = true }: AppShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!requireAuth || loading || user) return;
    const next = pathname && pathname !== '/login' ? `?next=${encodeURIComponent(pathname)}` : '';
    router.replace(`/login${next}`);
  }, [requireAuth, loading, user, router, pathname]);

  if (requireAuth && (loading || !user)) {
    return <AuthLoadingScreen showNav={showNav} />;
  }

  return (
    <div className="app-shell">
      {showNav && <Navbar />}
      <main className="app-main">
        {sidebar ? (
          <div className="app-layout">
            <section className="app-content">{children}</section>
            <aside className="app-aside">{sidebar}</aside>
          </div>
        ) : (
          <section className="app-content">{children}</section>
        )}
      </main>
    </div>
  );
}
