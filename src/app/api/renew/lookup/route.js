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

    // 0. Check if user is Blocked
    const BlockedUser = (await import('@/models/BlockedUser')).default;
    let cleanDigits = cleanIdentifier.replace(/\D/g, '');
    const coreDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

    const isBlocked = await BlockedUser.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        ...(coreDigits ? [{ mobile: { $regex: new RegExp(coreDigits + '$') } }] : [])
      ]
    });

    if (isBlocked) {
      const isEmailInput = cleanIdentifier.includes('@');
      const isEmailMatched = isBlocked.email && isBlocked.email.toLowerCase() === cleanIdentifier.toLowerCase();
      const blockedType = (isEmailInput || isEmailMatched) ? 'email' : 'mobile';

      return NextResponse.json({
        success: false,
        isBlocked: true,
        blockedType,
        message: blockedType === 'email' 
          ? 'Email blocked. Account Rejected. Please try with a new email.' 
          : 'Number blocked. Account Rejected. Please try with a new mobile number.'
      }, { status: 403 });
    }

    // 0.5 Check if user has a Pending payment request awaiting verification
    const Payment = (await import('@/models/Payment')).default;
    const pendingPayment = await Payment.findOne({
      status: 'Pending',
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        ...(coreDigits ? [{ mobile: { $regex: new RegExp(coreDigits + '$') } }] : [])
      ]
    }).populate('packageId');

    if (pendingPayment) {
      return NextResponse.json({
        success: true,
        isPending: true,
        pendingDetails: {
          amount: pendingPayment.amount,
          trx_id: pendingPayment.trx_id,
          packageName: pendingPayment.packageId?.name || 'Pro Plan',
          currency: pendingPayment.currency || 'BDT'
        }
      });
    }

    // Check if input is a key pattern (usually letters/digits, without @ and not just a phone number)
    const isEmail = cleanIdentifier.includes('@');
    const isPhone = !isEmail && /^\+?[0-9]{5,17}$/.test(cleanIdentifier.replace(/\s/g, ''));
    const isLicenseKey = !isEmail && !isPhone;

    // 1. Search User by Email, Key or Mobile (flexible prefix checking)
    let user = null;
    if (isEmail) {
      user = await User.findOne({ email: cleanIdentifier.toLowerCase() });
    } else if (isPhone) {
      user = await User.findOne({
        $or: [
          { mobile: cleanIdentifier },
          ...(coreDigits ? [{ mobile: { $regex: new RegExp(coreDigits + '$') } }] : [])
        ]
      });
    }

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

    if (!license && !user) {
      return NextResponse.json({ 
        success: false, 
        isLicenseKey,
        message: 'No user or license found.' 
      }, { status: 404 });
    }

    // Check if license is disabled
    const isLicenseDisabled = license ? (license.status === 'Disabled' || license.status === 'disabled') : false;

    const now = new Date();
    const expiry = license ? (license.expiresAt || license.expire_date) : null;
    const isActive = license ? (!isLicenseDisabled && (license.status === 'Active' || license.status === 'active') && new Date(expiry) > now) : false;
    const remainingCredits = license ? (license.currentCredits !== undefined ? license.currentCredits : Math.max(0, (license.credit_limit || 0) - (license.credits_used || 0))) : 0;

    // If user info doesn't exist yet (maybe created via license upload), fetch or use resolved user
    let resolvedUser = user;
    if (!resolvedUser && license && license.userId) {
      resolvedUser = await User.findById(license.userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        licenseKey: license ? (license.licenseKey || license.api_key) : '',
        status: license ? license.status : 'Active',
        isActive,
        isLicenseDisabled,
        isLicenseKey,
        currentCredits: remainingCredits,
        expiresAt: expiry,
        packageName: (license && license.packageId) ? license.packageId.name : 'Standard Plan',
        userInfo: resolvedUser ? { _id: resolvedUser._id, name: resolvedUser.name, email: resolvedUser.email, mobile: resolvedUser.mobile } : null
      }
    });

  } catch (error) {
    console.error('Renew Lookup Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
