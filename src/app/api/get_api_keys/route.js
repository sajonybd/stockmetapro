import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const license_key = searchParams.get('license_key');
    const pc_build_number = searchParams.get('pc_build_number'); // Optional

    if (!license_key) {
      return NextResponse.json({ success: false, keys: [], message: 'Missing license_key' });
    }

    await connectToDatabase();

    const license = await License.findOne({ api_key: license_key });

    if (!license) {
      return NextResponse.json({ success: false, keys: [], message: 'Invalid license key' });
    }

    // Activation Logic: If not activated, activate it now!
    if (!license.activation_date) {
      license.activation_date = new Date();
      
      const newExpireDate = new Date();
      newExpireDate.setDate(newExpireDate.getDate() + license.duration_days);
      license.expire_date = newExpireDate;
      
      await license.save();
    }

    // Check expiration
    if (new Date() > license.expire_date || license.status !== 'Active') {
      return NextResponse.json({ success: false, keys: [], message: 'License expired or revoked' });
    }

    // Optional: Lock to PC build number
    if (pc_build_number) {
      if (!license.pc_build_number) {
        // First time use, lock it
        license.pc_build_number = pc_build_number;
        await license.save();
      } else if (license.pc_build_number !== pc_build_number) {
        return NextResponse.json({ success: false, keys: [], message: 'License bound to another PC' });
      }
    }

    return NextResponse.json({
      success: true,
      keys: [license.api_key],
      credit: license.credit_limit,
      expire_date: license.expire_date,
      activation_date: license.createdAt,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, keys: [], message: 'Server error' }, { status: 500 });
  }
}
