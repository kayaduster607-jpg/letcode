'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/', label: '首页', icon: '🏠' },
  { href: '/learn', label: '学习路线', icon: '📚' },
  { href: '/wrong-book', label: '错题本', icon: '📝' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <nav className="top-nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <div className="brand-logo">H</div>
          <div className="min-w-0">
            <div className="brand-title one-line">Hot100 学习助手</div>
            <div className="brand-subtitle one-line">按题型建模 · 用提示训练解题思维</div>
          </div>
        </Link>

        <div className="nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          {user?.role === 'admin' && (
            <Link href="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}>
              <span>🔑</span>
              <span>管理</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {user.username}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
