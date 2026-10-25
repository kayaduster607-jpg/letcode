import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import WrongBookClient from './WrongBookClient';

export default async function WrongBookPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/wrong-book');
  return <WrongBookClient />;
}
