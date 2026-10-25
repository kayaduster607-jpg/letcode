import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LearnClient from './LearnClient';

export default async function LearnPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/learn');
  return <LearnClient />;
}
