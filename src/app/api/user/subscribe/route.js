import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';

import Package from '@/models/Package';

export async function POST(request) {
  const userId = request.cookies.get('user_session')?.value;
  
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { packageId } = await request.json();

    await connectToDatabase();

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return NextResponse.json({ success: false, message: 'Invalid package selected' }, { status: 400 });
    }

    const api_key = 'SK-' + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
    const newLicense = await License.create({
      api_key,
      credit_limit: selectedPackage.credit_limit,
      duration_days: selectedPackage.duration_days,
      userId,
    });

    return NextResponse.json({ success: true, data: newLicense });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
