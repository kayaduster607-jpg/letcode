import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { getProgress, saveProgress } from '@/lib/db';
import { normalizeProgress } from '@/lib/progress';

export async function GET() {
  try {
    const user = await requireUser();
    const progress = getProgress(user.id);
    return NextResponse.json({ progress });
  } catch {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const { progress } = await request.json();
    if (!progress || typeof progress !== 'object') {
      return NextResponse.json({ error: '缺少进度数据' }, { status: 400 });
    }
    saveProgress(user.id, normalizeProgress(progress));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
}
