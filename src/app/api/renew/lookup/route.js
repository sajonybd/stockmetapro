import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({ success: false, message: 'Please provide a Phone Number, Email, or License Key' }, { status: 400 });
    }

    await connectToDatabase();
    const cleanIdentifier = identifier.trim();

    // 1. Search User by Email or Mobile
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { mobile: cleanIdentifier }
      ]
    });

    // 2. Search License by Key or User ID
    let license = await License.findOne({
      $or: [
        { licenseKey: cleanIdentifier },
        { api_key: cleanIdentifier }
      ]
    }).populate('packageId');

    if (!license && user) {
      license = await License.findOne({ userId: user._id }).populate('packageId');
    }

    if (!license) {
      return NextResponse.json({ success: false, message: 'No license found with the provided information.' }, { status: 404 });
    }

    const now = new Date();
    const expiry = license.expiresAt || license.expire_date;
    const isActive = (license.status === 'Active' || license.status === 'active') && new Date(expiry) > now;
    const remainingCredits = license.currentCredits !== undefined ? license.currentCredits : Math.max(0, license.credit_limit - license.credits_used);

    return NextResponse.json({
      success: true,
      data: {
        licenseKey: license.licenseKey || license.api_key,
        status: license.status,
        isActive,
        currentCredits: remainingCredits,
        expiresAt: expiry,
        packageName: license.packageId ? license.packageId.name : 'Standard Plan',
        userInfo: user ? { name: user.name, email: user.email, mobile: user.mobile } : null
      }
    });

  } catch (error) {
    console.error('Renew Lookup Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
