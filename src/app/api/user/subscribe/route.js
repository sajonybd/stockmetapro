import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';

export async function POST(request) {
  const userId = request.cookies.get('user_session')?.value;
  
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { plan } = await request.json(); // 'basic', 'premium', 'pro'

    let credit_limit = 1000;
    if (plan === 'premium') credit_limit = 5000;
    if (plan === 'pro') credit_limit = 999999;

    await connectToDatabase();

    const api_key = 'SK-' + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
    const expire_date = new Date();
    expire_date.setDate(expire_date.getDate() + 30); // 1 month subscription

    const newLicense = await License.create({
      api_key,
      credit_limit,
      expire_date,
      userId,
    });

    return NextResponse.json({ success: true, data: newLicense });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
