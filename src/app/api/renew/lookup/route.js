import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({ success: false, message: 'Please provide a Phone Number, Email, or Key' }, { status: 400 });
    }

    await connectToDatabase();
    const cleanIdentifier = identifier.trim();

    // Check if input is a key pattern (usually letters/digits, without @ and not just a phone number)
    const isEmail = cleanIdentifier.includes('@');
    const isPhone = /^\+?[0-9]{8,15}$/.test(cleanIdentifier);
    const isLicenseKey = !isEmail && !isPhone;

    // 1. Search User by Email or Mobile
    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { mobile: cleanIdentifier }
      ]
    });

    // 2. Search License by Key
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
      return NextResponse.json({ 
        success: false, 
        isLicenseKey,
        message: 'No key found.' 
      }, { status: 404 });
    }

    // Check if license is disabled
    const isLicenseDisabled = license.status === 'Disabled' || license.status === 'disabled';

    const now = new Date();
    const expiry = license.expiresAt || license.expire_date;
    const isActive = !isLicenseDisabled && (license.status === 'Active' || license.status === 'active') && new Date(expiry) > now;
    const remainingCredits = license.currentCredits !== undefined ? license.currentCredits : Math.max(0, license.credit_limit - license.credits_used);

    // If user info doesn't exist yet (maybe created via license upload), fetch or mock it
    let resolvedUser = user;
    if (!resolvedUser && license.userId) {
      resolvedUser = await User.findById(license.userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        licenseKey: license.licenseKey || license.api_key,
        status: license.status,
        isActive,
        isLicenseDisabled,
        isLicenseKey,
        currentCredits: remainingCredits,
        expiresAt: expiry,
        packageName: license.packageId ? license.packageId.name : 'Standard Plan',
        userInfo: resolvedUser ? { name: resolvedUser.name, email: resolvedUser.email, mobile: resolvedUser.mobile } : null
      }
    });

  } catch (error) {
    console.error('Renew Lookup Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
