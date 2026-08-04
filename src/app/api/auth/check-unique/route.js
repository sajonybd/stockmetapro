import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { field, value } = await request.json();

    if (!field || !value) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();
    
    let isUsed = false;
    let isBlocked = false;
    
    const BlockedUser = (await import('@/models/BlockedUser')).default;

    const License = (await import('@/models/License')).default;
    const Payment = (await import('@/models/Payment')).default;
    let isPending = false;
    let isDisabled = false;

    if (field === 'mobile') {
      const cleanMobile = value.trim();
      const cleanDigits = cleanMobile.replace(/\D/g, '');
      const coreDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
      
      const existingUsers = await User.find({
        $or: [
          { mobile: cleanMobile },
          ...(coreDigits ? [{ mobile: { $regex: new RegExp(coreDigits + '$') } }] : [])
        ]
      });

      if (existingUsers.length > 0) {
        const userIds = existingUsers.map(u => u._id);
        const hasLicense = await License.findOne({ userId: { $in: userIds } });
        isUsed = !!hasLicense;

        const disabledLicense = await License.findOne({ 
          userId: { $in: userIds }, 
          status: { $in: ['Disabled', 'disabled'] } 
        });
        isDisabled = !!disabledLicense;
      }

      if (coreDigits) {
        const blocked = await BlockedUser.findOne({ mobile: { $regex: new RegExp(coreDigits + '$') } });
        isBlocked = !!blocked;
        const pending = await Payment.findOne({ status: 'Pending', mobile: { $regex: new RegExp(coreDigits + '$') } });
        isPending = !!pending;
      }
    } else if (field === 'email') {
      const cleanEmail = value.toLowerCase().trim();
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        const hasLicense = await License.findOne({ userId: existing._id });
        isUsed = !!hasLicense;

        const disabledLicense = await License.findOne({ 
          userId: existing._id, 
          status: { $in: ['Disabled', 'disabled'] } 
        });
        isDisabled = !!disabledLicense;
      }
      const blocked = await BlockedUser.findOne({ email: cleanEmail });
      isBlocked = !!blocked;
      const pending = await Payment.findOne({ status: 'Pending', email: cleanEmail });
      isPending = !!pending;
    }

    if (isDisabled) {
      const msg = field === 'email' ? 'This email belongs to a disabled account. Please contact support.' : 'This number belongs to a disabled account. Please contact support.';
      return NextResponse.json({ success: true, isUsed: true, isDisabled: true, message: msg });
    }

    if (isBlocked) {
      const msg = field === 'email' ? 'Email blocked. Please try with another email address.' : 'Number blocked. Please try with another mobile number.';
      return NextResponse.json({ success: true, isUsed: true, isBlocked: true, blockedType: field, message: msg });
    }

    if (isPending) {
      const msg = field === 'email' ? 'This email address has a payment pending verification.' : 'This phone number has a payment pending verification.';
      return NextResponse.json({ success: true, isUsed: true, isPending: true, message: msg });
    }

    return NextResponse.json({ success: true, isUsed, isBlocked: false, isPending: false, isDisabled: false });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
