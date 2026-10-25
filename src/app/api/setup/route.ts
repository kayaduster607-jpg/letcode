import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: '管理员账号已由系统预置，不允许通过页面或接口再次初始化。' },
    { status: 403 }
  );
}
