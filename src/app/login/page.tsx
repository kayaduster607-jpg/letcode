'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function normalizeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/login')) {
    return '/';
  }
  return value;
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState('/');
  const [nextPathReady, setNextPathReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(normalizeNextPath(params.get('next')));
    const message = params.get('error');
    if (message) setError(message);
    setNextPathReady(true);
  }, []);

  useEffect(() => {
    if (!loading && user && nextPathReady) {
      router.replace(nextPath);
    }
  }, [user, loading, router, nextPath, nextPathReady]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || `登录服务异常（${response.status}），请检查本地服务或服务器日志。`);
        return;
      }

      await refresh();
      router.replace(nextPath);
    } catch {
      setError('网络错误：请确认开发服务仍在运行，然后重新登录。');
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="rounded-lg border border-slate-200 bg-white px-8 py-6 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-lg bg-blue-100" />
          <div className="text-base font-semibold text-slate-600">正在校验登录状态...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb] px-6 py-10 text-slate-950">
      <section className="w-full max-w-[460px] rounded-lg border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
            H
          </div>
          <div className="mt-4 text-lg font-bold leading-tight">Hot100 学习助手</div>
          <div className="mt-1 text-sm text-slate-500">请输入管理员分配的账号</div>
        </div>

        <div className="mb-7 text-center">
          <p className="text-sm font-semibold text-blue-600">账号登录</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950">
            进入刷题系统
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            登录前不展示任何账号数据；进入系统后只读取当前登录账号的信息。
          </p>
        </div>

        <form action="/api/auth/login" method="post" onSubmit={handleSubmit} className="grid gap-5">
          <input type="hidden" name="next" value={nextPath} />
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-bold text-slate-800">
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="请输入用户名"
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-slate-800">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="请输入密码"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 h-12 w-full rounded-md bg-blue-600 px-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? '正在登录...' : '登录'}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          普通账号只能访问自己的学习内容；账号密码由管理员统一维护。
        </div>
      </section>
    </main>
  );
}
