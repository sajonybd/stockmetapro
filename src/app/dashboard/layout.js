import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const cookieStore = cookies();
  const userSession = cookieStore.get('user_session');

  if (!userSession || !userSession.value) {
    redirect('/login');
  }

  return children;
}
