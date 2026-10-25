import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: '系统已预置 1 个管理员账号和 10 个普通用户账号，不开放自助注册。' },
    { status: 403 }
  );
}
