import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';
import ThirdPartyKey from '@/models/ThirdPartyKey';

export async function POST(request) {
  try {
    const { license_key, pc_build_number } = await request.json();

    if (!license_key || !pc_build_number) {
      return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
    }

    await connectToDatabase();

    const license = await License.findOne({ api_key: license_key });

    if (!license) return NextResponse.json({ success: false, message: 'Invalid license' }, { status: 401 });
    if (license.status !== 'Active') return NextResponse.json({ success: false, message: 'License inactive' }, { status: 401 });
    if (new Date() > new Date(license.expire_date)) return NextResponse.json({ success: false, message: 'License expired' }, { status: 401 });
    if (license.credits_used >= license.credit_limit) return NextResponse.json({ success: false, message: 'Credit limit reached' }, { status: 401 });

    if (!license.pc_build_number) {
      license.pc_build_number = pc_build_number;
      await license.save();
    } else if (license.pc_build_number !== pc_build_number) {
      return NextResponse.json({ success: false, message: 'Invalid PC' }, { status: 401 });
    }

    // Fetch all active 3rd party keys
    const thirdPartyKeys = await ThirdPartyKey.find({ is_active: true }).select('service_name api_key -_id');

    return NextResponse.json({ success: true, keys: thirdPartyKeys });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
