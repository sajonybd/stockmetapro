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
    const rawKeys = await ThirdPartyKey.find({ is_active: true });
    const now = new Date();
    const activeValidKeys = [];

    for (const key of rawKeys) {
      let currentRpm = key.rpm_count || 0;
      let currentReset = new Date(key.reset_at);

      // Check if minute reset boundary has been crossed
      if (now > currentReset) {
        currentRpm = 0;
        const nextReset = new Date();
        nextReset.setSeconds(0, 0);
        nextReset.setMinutes(nextReset.getMinutes() + 1);
        key.reset_at = nextReset;
        key.rpm_count = 0;
        
        await ThirdPartyKey.updateOne(
          { _id: key._id },
          { $set: { rpm_count: 0, reset_at: nextReset } }
        );
      }

      // Check limits: Only distribute key if it is Live and under 15 RPM
      if (key.original_status === 'Live' && currentRpm < 15) {
        // Increment RPM count for the distributed request key load
        await ThirdPartyKey.updateOne(
          { _id: key._id },
          { $inc: { rpm_count: 1 } }
        );
        activeValidKeys.push({
          service_name: key.service_name,
          api_key: key.api_key
        });
      }
    }

    return NextResponse.json({ success: true, keys: activeValidKeys });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
