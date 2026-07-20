import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';

import User from '@/models/User';

// Check auth (can be handled by middleware, but good to ensure db connection)
export async function GET() {
  try {
    await connectToDatabase();
    const licenses = await License.find().populate('userId', 'name email').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: licenses });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { credit_limit, duration_days } = await request.json();

    if (!credit_limit || !duration_days) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Generate random string key
    const api_key = 'SK-' + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
    
    const newLicense = await License.create({
      api_key,
      credit_limit: parseInt(credit_limit, 10),
      duration_days: parseInt(duration_days, 10),
    });

    return NextResponse.json({ success: true, data: newLicense });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    }

    await connectToDatabase();
    await License.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'License deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
