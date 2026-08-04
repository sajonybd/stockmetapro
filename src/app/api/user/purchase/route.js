import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Package from '@/models/Package';

export async function POST(request) {
  try {
    const body = await request.json();
    const { packageId, licenseId, name, email, mobile, payment_method, trx_id, amount, currency, userId: payloadUserId, bypass_sms } = body;
    
    let userId = request.cookies.get('user_session')?.value || payloadUserId;
    
    if (!userId) {
      // Fallback: Generate a temporary mock ObjectId if no session exists to bypass unauthorized blocks
      const mongoose = (await import('mongoose')).default;
      userId = new mongoose.Types.ObjectId().toString();
    }

    if (!packageId || !name || !email || !mobile || !payment_method || !trx_id) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if Email or Mobile is already registered by another user
    const User = (await import('@/models/User')).default;
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { mobile: mobile.trim() }
      ]
    });

    if (existingUser) {
      // If user is renewing or user details match existing registered account
      if (licenseId || payloadUserId === existingUser._id.toString() || !payloadUserId) {
        userId = existingUser._id.toString();
      } else if (existingUser._id.toString() !== userId) {
        const fieldMatched = existingUser.email.toLowerCase() === email.toLowerCase().trim() ? 'Email' : 'Mobile';
        return NextResponse.json({ 
          success: false, 
          message: `${fieldMatched} is already used. Please enter a different one.` 
        }, { status: 400 });
      }
    }

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return NextResponse.json({ success: false, message: 'Invalid package selected' }, { status: 400 });
    }

    // Check if SMS Webhook has already parsed and registered this TrxID
    const Transaction = (await import('@/models/Transaction')).default;
    const License = (await import('@/models/License')).default;
    
    const matchingTx = await Transaction.findOne({ trxId: trx_id });
    const isApproved = !!matchingTx;

    // Reject on mismatch only if bypass_sms flag is false
    if (!isApproved && !bypass_sms) {
      return NextResponse.json({ success: false, message: 'Invalid Transaction ID or SMS not received yet.' }, { status: 400 });
    }

    let targetLicenseId = null;
    if (licenseId) {
      const mongoose = (await import('mongoose')).default;
      if (mongoose.Types.ObjectId.isValid(licenseId)) {
        targetLicenseId = licenseId;
      } else {
        const LicenseModel = (await import('@/models/License')).default;
        const licDoc = await LicenseModel.findOne({ $or: [{ licenseKey: licenseId }, { api_key: licenseId }] });
        if (licDoc) {
          targetLicenseId = licDoc._id;
        }
      }
    }

    const newPayment = await Payment.create({
      userId,
      packageId,
      licenseId: targetLicenseId,
      name,
      email,
      mobile,
      payment_method,
      trx_id,
      amount: amount || (currency === 'USD' ? selectedPackage.price_usd : selectedPackage.price_tk),
      currency: currency || 'BDT',
      status: isApproved ? 'Approved' : 'Pending',
    });

    if (isApproved) {
      // Auto-approve and provision key immediately if SMS transaction matches
      if (licenseId) {
        const license = await License.findOne({ $or: [{ licenseKey: licenseId }, { api_key: licenseId }] });
        if (license) {
          license.status = 'Active';
          license.credit_limit += selectedPackage.credit_limit;
          const currentExpiry = new Date(license.expire_date || new Date());
          currentExpiry.setDate(currentExpiry.getDate() + selectedPackage.duration_days);
          license.expire_date = currentExpiry;
          license.expiresAt = currentExpiry;
          await license.save();
        }
      } else {
        // Create new active license using SMPBD-XXXXX-XXXXX-XXXXX format
        const { generateLicenseKey } = await import('@/lib/services/licenseService');
        const api_key = generateLicenseKey();
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + selectedPackage.duration_days);

        await License.create({
          api_key,
          userId,
          packageId,
          credit_limit: selectedPackage.credit_limit,
          currentCredits: selectedPackage.credit_limit,
          duration_days: selectedPackage.duration_days,
          status: 'Active',
          expire_date: expiry,
          expiresAt: expiry,
          activation_date: new Date()
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: newPayment,
      isAutoApproved: isApproved,
      message: isApproved 
        ? 'Payment verified and approved automatically!' 
        : 'Payment received. Awaiting SMS verification from your phone.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
