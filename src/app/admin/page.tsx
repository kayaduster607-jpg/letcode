import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  if (user.role !== 'admin') redirect('/');
  return <AdminClient />;
}
