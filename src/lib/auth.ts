import { cookies } from 'next/headers';
import { getSession, findUserById } from './db';
import { User } from '@/types';
import { verifyPassword } from './password';

const SESSION_COOKIE = 'hot100_session';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = getSession(token);
  if (!session) return null;
  return findUserById(session.userId) || null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== 'admin') throw new Error('Forbidden');
  return user;
}

export { SESSION_COOKIE };
export { hashPassword, verifyPassword } from './password';
