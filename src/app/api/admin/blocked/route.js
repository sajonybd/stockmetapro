import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BlockedUser from '@/models/BlockedUser';
import { cookies } from 'next/headers';

const checkAuth = async () => {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return adminSession && adminSession.value === 'authenticated';
};

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectToDatabase();
    const blockedList = await BlockedUser.find().sort({ blockedAt: -1 });
    return NextResponse.json({ success: true, data: blockedList });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing blocked user ID' }, { status: 400 });
    }
    await connectToDatabase();
    await BlockedUser.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'User unblocked and removed successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
