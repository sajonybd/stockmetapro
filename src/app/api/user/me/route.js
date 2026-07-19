import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import License from '@/models/License';

export async function GET(request) {
  const userId = request.cookies.get('user_session')?.value;
  
  if (!userId) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  await connectToDatabase();
  const user = await User.findById(userId).select('-password');
  const licenses = await License.find({ userId }).sort({ createdAt: -1 });

  return NextResponse.json({ success: true, user, licenses });
}
