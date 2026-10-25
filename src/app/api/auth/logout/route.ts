import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      deleteSession(token);
    } catch (error) {
      console.error('Failed to delete session during logout:', error);
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
