import { NextResponse } from 'next/server';
import { findUserByUsername, createSession } from '@/lib/db';
import { verifyPassword, SESSION_COOKIE } from '@/lib/auth';

function normalizeNextPath(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/login')) {
    return '/';
  }
  return value;
}

function loginError(request: Request, message: string, status: number, wantsJson: boolean, nextPath = '/') {
  if (wantsJson) {
    return NextResponse.json({ error: message }, { status });
  }

  const redirectUrl = new URL('/login', request.url);
  redirectUrl.searchParams.set('error', message);
  if (nextPath !== '/') redirectUrl.searchParams.set('next', nextPath);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  const wantsJson = contentType.includes('application/json');
  let nextPath = '/';

  try {
    let username: unknown;
    let password: unknown;

    if (wantsJson) {
      try {
        ({ username, password } = await request.json());
      } catch {
        return loginError(request, '请求格式错误', 400, true);
      }
    } else {
      const formData = await request.formData();
      username = formData.get('username');
      password = formData.get('password');
      nextPath = normalizeNextPath(formData.get('next'));
    }

    const normalizedUsername = typeof username === 'string' ? username.trim() : '';
    const normalizedPassword = typeof password === 'string' ? password.trim() : '';

    if (!normalizedUsername || !normalizedPassword) {
      return loginError(request, '请输入用户名和密码', 400, wantsJson, nextPath);
    }

    const user = findUserByUsername(normalizedUsername);
    if (!user || !verifyPassword(normalizedPassword, user.passwordHash)) {
      return loginError(request, '用户名或密码错误', 401, wantsJson, nextPath);
    }

    const token = createSession(user.id);

    const response = wantsJson
      ? NextResponse.json({
          user: { id: user.id, username: user.username, role: user.role },
        })
      : NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    return loginError(request, '登录失败', 500, wantsJson, nextPath);
  }
}
