import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SystemSetting from '@/models/SystemSetting';

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await SystemSetting.findOne({ key: 'maintenance_mode' });
    return NextResponse.json({ success: true, maintenance: setting ? setting.value : false });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { maintenance } = await request.json();
    await connectToDatabase();
    
    await SystemSetting.findOneAndUpdate(
      { key: 'maintenance_mode' },
      { value: maintenance },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, message: 'Maintenance mode updated', maintenance });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
