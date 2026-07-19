import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectToDatabase();
    
    const count = await Admin.countDocuments();
    if (count > 0) {
      return NextResponse.json({ success: false, message: 'Admin already exists. Setup route disabled.' }, { status: 403 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await Admin.create({
      username: 'admin',
      password: hashedPassword
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Admin created successfully. Default password is: admin123. Please login and change it.' 
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
