import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Protect /admin and /api/admin/* routes
  const isProtectedPath = path.startsWith('/admin') || (path.startsWith('/api/admin') && !path.startsWith('/api/admin/login'));
  
  if (isProtectedPath) {
    const session = request.cookies.get('admin_session');
    
    if (!session || session.value !== 'authenticated') {
      // If it's an API route, return 401 Unauthorized
      if (path.startsWith('/api/')) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
      
      // If it's a page, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
