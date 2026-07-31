import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SystemSetting from '@/models/SystemSetting';

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await SystemSetting.findOne({ key: 'maintenance_mode' });
    const isMaintenance = setting ? setting.value === true : false;
    
    return NextResponse.json({
      maintenance: isMaintenance,
      message: isMaintenance 
        ? "Server is currently under maintenance. Please try again later." 
        : "Server is running normally."
    });
  } catch (error) {
    // In case of DB error, default to not in maintenance so app doesn't lock up
    return NextResponse.json({ maintenance: false, message: "Error checking status" });
  }
}
