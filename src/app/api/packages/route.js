import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Package from '@/models/Package';

export async function GET() {
  try {
    await connectToDatabase();
    const packages = await Package.find().sort({ price_tk: 1 });
    return NextResponse.json({ success: true, data: packages });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
