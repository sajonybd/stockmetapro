import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SoftwareError from '@/models/SoftwareError';

export async function GET() {
  try {
    await connectToDatabase();
    // Fetch latest 100 errors, sorted by newest first
    const errors = await SoftwareError.find().sort({ createdAt: -1 }).limit(100);
    return NextResponse.json({ success: true, data: errors });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
