import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ReportedApiKey from '@/models/ReportedApiKey';
import { cookies } from 'next/headers';

const checkAuth = async () => {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return adminSession && adminSession.value === 'authenticated';
};

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  
  try {
    await connectToDatabase();
    const keys = await ReportedApiKey.find().sort({ reported_at: -1 });
    return NextResponse.json({ success: true, data: keys });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
