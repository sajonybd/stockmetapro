import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';
import Notice from '@/models/Notice';

export async function POST(request) {
  try {
    const { license_key, pc_build_number } = await request.json();

    if (!license_key || !pc_build_number) {
      return NextResponse.json({ success: false, message: 'Missing credentials' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify License
    const license = await License.findOne({ api_key: license_key });

    if (!license) return NextResponse.json({ success: false, message: 'Invalid license' }, { status: 401 });
    if (license.status !== 'Active') return NextResponse.json({ success: false, message: 'License inactive' }, { status: 401 });
    if (new Date() > new Date(license.expire_date)) return NextResponse.json({ success: false, message: 'License expired' }, { status: 401 });
    if (license.pc_build_number && license.pc_build_number !== pc_build_number) {
      return NextResponse.json({ success: false, message: 'Invalid PC' }, { status: 401 });
    }

    // Fetch active notice
    const notice = await Notice.findOne();

    if (notice && notice.is_active) {
      return NextResponse.json({ success: true, has_notice: true, message: notice.message });
    }

    return NextResponse.json({ success: true, has_notice: false, message: '' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
