import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  createManagedUser,
  deleteManagedUser,
  getAllProgress,
  getAllUsers,
  isSeededUser,
  updateUserPassword,
} from '@/lib/db';
import { problems } from '@/data/problems';

function adminError() {
  return NextResponse.json({ error: '无权限' }, { status: 403 });
}

export async function GET() {
  try {
    await requireAdmin();
    const users = getAllUsers();
    const allProgress = getAllProgress();

    const totalProblems = problems.length;
    const userList = users.map((user) => {
      const progress = allProgress[user.id];
      const completedCount = progress?.completedProblemIds?.length ?? 0;
      const wrongCount = progress?.wrongProblemIds?.length ?? 0;
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        completedCount,
        wrongCount,
        totalProblems,
        percent: totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0,
        studyDays: progress?.studyDays ?? 0,
        lastStudyDate: progress?.lastStudyDate ?? null,
        canDelete: user.role === 'user' && !isSeededUser(user.id),
        isSeeded: isSeededUser(user.id),
        progress: progress || null,
      };
    });

    return NextResponse.json({ users: userList });
  } catch {
    return adminError();
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { username, password } = await request.json();
    const result = createManagedUser(
      typeof username === 'string' ? username : '',
      typeof password === 'string' ? password : ''
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.reason || '新增用户失败' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, user: result.user });
  } catch {
    return adminError();
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { userId, password } = await request.json();
    const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
    const normalizedPassword = typeof password === 'string' ? password.trim() : '';

    if (!normalizedUserId || !normalizedPassword) {
      return NextResponse.json({ error: '请选择用户并输入新密码' }, { status: 400 });
    }

    if (normalizedPassword.length < 6) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
    }

    const result = updateUserPassword(normalizedUserId, normalizedPassword);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason || '修改失败' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return adminError();
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { userId } = await request.json();
    const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';

    if (!normalizedUserId) {
      return NextResponse.json({ error: '请选择要删除的用户' }, { status: 400 });
    }

    const result = deleteManagedUser(normalizedUserId);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason || '删除失败' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return adminError();
  }
}
