import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';
import UsageLog from '@/models/UsageLog';

export async function POST(request) {
  try {
    const { license_key, pc_build_number, credits_to_deduct, action_description } = await request.json();

    if (!license_key || !pc_build_number || !credits_to_deduct || !action_description) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();

    const license = await License.findOne({ api_key: license_key });

    // Validate License
    if (!license) return NextResponse.json({ success: false, message: 'Invalid license' }, { status: 401 });
    if (license.status !== 'Active') return NextResponse.json({ success: false, message: 'License inactive' }, { status: 401 });
    if (new Date() > new Date(license.expire_date)) return NextResponse.json({ success: false, message: 'License expired' }, { status: 401 });
    if (license.pc_build_number !== pc_build_number) return NextResponse.json({ success: false, message: 'Invalid PC' }, { status: 401 });

    const amount = parseInt(credits_to_deduct, 10);
    
    // Check if enough credits
    if (license.credits_used + amount > license.credit_limit) {
       return NextResponse.json({ success: false, message: 'Insufficient credits' }, { status: 402 });
    }

    // Deduct credits (add to credits_used)
    license.credits_used += amount;
    await license.save();

    // Log the usage
    await UsageLog.create({
      licenseId: license._id,
      credits_deducted: amount,
      action_description: action_description,
    });

    return NextResponse.json({ success: true, message: 'Usage synced successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
