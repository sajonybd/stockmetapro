import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    await connectToDatabase();
    
    // Check if any admin exists
    const admin = await Admin.findOne({ username: 'admin' });

    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        message: 'No admin found. Please visit /api/admin/setup to create the first admin.' 
      }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      const response = NextResponse.json({ success: true });
      // Set an HttpOnly cookie for session
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
