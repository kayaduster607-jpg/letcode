'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/contexts/AuthContext';

interface UserWithProgress {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
  completedCount: number;
  wrongCount: number;
  totalProblems: number;
  percent: number;
  studyDays: number;
  lastStudyDate: string | null;
  canDelete: boolean;
  isSeeded: boolean;
  progress: {
    completedProblemIds: number[];
    wrongProblemIds: number[];
    studyDays: number;
    lastStudyDate: string | null;
  } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [passwordInputs, setPasswordInputs] = useState<Record<string, string>>({});
  const [savingPasswordFor, setSavingPasswordFor] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setFetching(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || '获取用户数据失败');
        return;
      }
      setUsers(data.users || []);
    } catch {
      setError('网络错误，请确认服务仍在运行');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    void loadUsers();
  }, [user, loadUsers]);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      if (a.isSeeded !== b.isSeeded) return a.isSeeded ? -1 : 1;
      return a.username.localeCompare(b.username, 'zh-CN');
    });
  }, [users]);

  const stats = useMemo(() => {
    const normalUsers = users.filter((item) => item.role === 'user');
    const average = normalUsers.length
      ? Math.round(normalUsers.reduce((sum, item) => sum + item.percent, 0) / normalUsers.length)
      : 0;
    return {
      total: users.length,
      custom: users.filter((item) => item.canDelete).length,
      totalProblems: users[0]?.totalProblems ?? 100,
      average,
    };
  }, [users]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-slate-400">正在校验管理员身份...</div>
        </div>
      </AppShell>
    );
  }

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim() || !newPassword.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setCreatingUser(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || '新增用户失败');
        return;
      }
      setSuccess(`已新增用户 ${data.user?.username || newUsername.trim()}`);
      setNewUsername('');
      setNewPassword('');
      await loadUsers();
    } catch {
      setError('网络错误，新增用户失败');
    } finally {
      setCreatingUser(false);
    }
  };

  const handlePasswordChange = async (targetUser: UserWithProgress) => {
    const password = (passwordInputs[targetUser.id] || '').trim();
    setError('');
    setSuccess('');

    if (!password) {
      setError('请输入新密码');
      return;
    }

    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }

    setSavingPasswordFor(targetUser.id);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser.id, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || '修改密码失败');
        return;
      }
      setPasswordInputs((current) => ({ ...current, [targetUser.id]: '' }));
      setSuccess(`已更新 ${targetUser.username} 的密码`);
    } catch {
      setError('网络错误，密码未修改');
    } finally {
      setSavingPasswordFor(null);
    }
  };

  const handleDeleteUser = async (targetUser: UserWithProgress) => {
    if (!targetUser.canDelete) return;
    const confirmed = window.confirm(`确定删除用户 ${targetUser.username} 吗？该用户的学习进度、笔记和错题记录都会删除。`);
    if (!confirmed) return;

    setError('');
    setSuccess('');
    setDeletingUserId(targetUser.id);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || '删除用户失败');
        return;
      }
      setSuccess(`已删除用户 ${targetUser.username}`);
      await loadUsers();
    } catch {
      setError('网络错误，删除用户失败');
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="bg-slate-950 px-8 py-7 text-white">
              <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Admin Console</div>
              <h1 className="mt-3 text-3xl font-black">用户与进度管理</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                管理员可以新增普通用户、修改普通用户密码，并查看每个账号的学习进度。预置账号用于固定班级账号池，会被系统保护。
              </p>
              <div className="mt-6 grid grid-cols-4 gap-3">
                <StatCard label="账号数" value={stats.total} />
                <StatCard label="自建账号" value={stats.custom} />
                <StatCard label="题目数" value={stats.totalProblems} />
                <StatCard label="平均完成" value={`${stats.average}%`} />
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="border-l border-slate-100 bg-slate-50 px-6 py-7">
              <div className="text-sm font-black text-slate-900">新增普通用户</div>
              <p className="mt-1 text-xs leading-5 text-slate-500">新账号会从 0 进度开始，只能访问自己的学习数据。</p>
              <label className="mt-5 block text-xs font-bold text-slate-500" htmlFor="new-username">用户名</label>
              <input
                id="new-username"
                value={newUsername}
                onChange={(event) => setNewUsername(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="例如 student11"
                autoComplete="off"
              />
              <label className="mt-4 block text-xs font-bold text-slate-500" htmlFor="new-password">初始密码</label>
              <input
                id="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="至少 6 位"
                autoComplete="new-password"
              />
              <button
                type="submit"
                disabled={creatingUser}
                className="mt-5 h-11 w-full rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingUser ? '正在新增...' : '新增用户'}
              </button>
            </form>
          </div>
        </section>

        {error && <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div>}
        {success && <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">{success}</div>}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-black text-slate-950">账号列表</h2>
              <p className="mt-1 text-xs text-slate-500">普通用户可改密码；自建用户可删除。</p>
            </div>
            <button
              type="button"
              onClick={() => void loadUsers()}
              className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              刷新
            </button>
          </div>

          {fetching ? (
            <div className="grid gap-3 p-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedUsers.map((item) => (
                <UserRow
                  key={item.id}
                  user={item}
                  passwordValue={passwordInputs[item.id] || ''}
                  onPasswordInput={(value) => setPasswordInputs((current) => ({ ...current, [item.id]: value }))}
                  onSavePassword={() => void handlePasswordChange(item)}
                  onDelete={() => void handleDeleteUser(item)}
                  savingPassword={savingPasswordFor === item.id}
                  deleting={deletingUserId === item.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function UserRow({
  user,
  passwordValue,
  onPasswordInput,
  onSavePassword,
  onDelete,
  savingPassword,
  deleting,
}: {
  user: UserWithProgress;
  passwordValue: string;
  onPasswordInput: (value: string) => void;
  onSavePassword: () => void;
  onDelete: () => void;
  savingPassword: boolean;
  deleting: boolean;
}) {
  const roleLabel = user.role === 'admin' ? '管理员' : user.isSeeded ? '预置学员' : '自建学员';

  return (
    <div className="grid gap-4 px-6 py-5 xl:grid-cols-[280px_minmax(260px,1fr)_420px] xl:items-center">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-white ${user.role === 'admin' ? 'bg-slate-900' : user.isSeeded ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          {user.username.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-base font-black text-slate-950">{user.username}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-500">{roleLabel}</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            创建于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
            {user.lastStudyDate ? ` · 最近学习 ${user.lastStudyDate}` : ''}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>完成 {user.completedCount}/{user.totalProblems}</span>
          <span>{user.percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${user.percent}%` }} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500">
          <span>错题 {user.wrongCount}</span>
          <span>学习天数 {user.studyDays}</span>
          <span>{user.canDelete ? '可删除' : user.role === 'admin' ? '系统账号' : '受保护'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {user.role === 'user' ? (
          <>
            <div className="min-w-0 flex-1">
              <label htmlFor={`password-${user.id}`} className="mb-2 block text-xs font-bold text-slate-500">
                修改密码
              </label>
              <input
                id={`password-${user.id}`}
                type="text"
                value={passwordValue}
                onChange={(event) => onPasswordInput(event.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                placeholder="输入新密码"
              />
            </div>
            <button
              type="button"
              onClick={onSavePassword}
              disabled={savingPassword}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPassword ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={!user.canDelete || deleting}
              className="h-10 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
              title={user.canDelete ? '删除这个自建账号' : '预置账号不能删除'}
            >
              {deleting ? '删除中...' : '删除'}
            </button>
          </>
        ) : (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 ring-1 ring-slate-100">
            管理员账号不在这里修改
          </div>
        )}
      </div>
    </div>
  );
}
