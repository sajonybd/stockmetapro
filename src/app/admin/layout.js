import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import Link from 'next/link';

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');

  if (!adminSession || adminSession.value !== 'authenticated') {
    redirect('/admin-login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar / Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Admin Portal</h2>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            Manage Licenses
          </Link>
          <Link href="/admin/third-party-keys" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            Third-Party API Keys
          </Link>
          <Link href="/admin/notice" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            Software Notice
          </Link>
          <Link href="/admin/docs" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            Developer API Docs
          </Link>
          <Link href="/admin/change-password" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            Change Password
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
