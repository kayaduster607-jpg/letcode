import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  const totalUsers = getAllUsers().length;

  if (!user) {
    return NextResponse.json({ user: null, needsSetup: false, totalUsers });
  }

  return NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role },
    needsSetup: false,
    totalUsers,
  });
}
