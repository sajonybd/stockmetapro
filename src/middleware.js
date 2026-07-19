import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Protect Admin routes
  const isAdminPath = path.startsWith('/admin') && path !== '/admin-login';
  if (isAdminPath) {
    const session = request.cookies.get('admin_session');
    if (!session || session.value !== 'authenticated') {
      if (path.startsWith('/api/')) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // Protect User Dashboard routes
  const isUserPath = path.startsWith('/dashboard') || path.startsWith('/api/user');
  if (isUserPath) {
    const userSession = request.cookies.get('user_session');
    if (!userSession) {
      if (path.startsWith('/api/')) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin', '/admin/:path*', 
    '/api/admin', '/api/admin/:path*', 
    '/dashboard', '/dashboard/:path*', 
    '/api/user', '/api/user/:path*'
  ],
};
