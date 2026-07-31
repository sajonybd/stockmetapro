import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Notice from '@/models/Notice';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    // We only need one global notice, so we'll just find the first one
    let notice = await Notice.findOne();
    
    if (!notice) {
      notice = await Notice.create({ message: 'Welcome to the software!', is_active: false });
    }

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { message, is_active } = await request.json();
    
    await connectToDatabase();
    let notice = await Notice.findOne();

    if (!notice) {
      notice = await Notice.create({ message, is_active, updatedAt: new Date() });
    } else {
      notice.message = message;
      notice.is_active = is_active;
      notice.updatedAt = new Date();
      await notice.save();
    }

    return NextResponse.json({ success: true, data: notice });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
