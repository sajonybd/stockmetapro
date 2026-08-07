import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Package from '@/models/Package';
import Transaction from '@/models/Transaction';
import License from '@/models/License';


export async function POST(request) {
  try {
    const body = await request.json();
    const {
      packageId, licenseId, name, email, mobile,
      payment_method, trx_id, amount, currency,
      userId: payloadUserId, bypass_sms,
      attempt = 1 // 1st submit = check only, 2nd submit = create Pending
    } = body;
    
    let userId = request.cookies.get('user_session')?.value || payloadUserId;
    
    if (!userId) {
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

    // Determine if this is a global payment method (Payoneer/Skrill — no SMS verification needed)
    const isGlobalMethod = bypass_sms === true || ['Payoneer', 'Skrill'].includes(payment_method);

    // ── DEBUG LOGS TO IDENTIFY THE ISSUE ──
    console.log(`[DEBUG Purchase] Incoming trx_id: "${trx_id}" (Length: ${trx_id ? trx_id.length : 0})`);
    console.log(`[DEBUG Purchase] bypass_sms: ${bypass_sms}, isGlobalMethod: ${isGlobalMethod}, attempt: ${attempt}`);
    
    // Let's dump all unused transactions in DB to console for live inspection
    const allUnused = await Transaction.find({ status: 'Unused' });
    console.log(`[DEBUG Purchase] Unused Transactions count in DB: ${allUnused.length}`);
    allUnused.forEach(tx => {
      console.log(`  - DB TrxID: "${tx.trxId}" (Length: ${tx.trxId ? tx.trxId.length : 0}) | status: ${tx.status}`);
    });

    // Look for matching SMS transaction in the pool with whitespace tolerance
    const searchTrxId = trx_id.trim();
    const matchingTx = isGlobalMethod
      ? null
      : await Transaction.findOne({ 
          trxId: { $regex: new RegExp(`^\\s*${searchTrxId}\\s*$`, 'i') },
          status: 'Unused' 
        });
    const isApproved = !!matchingTx;
    console.log(`[DEBUG Purchase] matchingTx Found: ${isApproved ? 'YES' : 'NO'}`);

    // ── Attempt 1 (Local BDT): If not found in SMS pool, fail immediately without saving to DB ──
    if (!isApproved && !isGlobalMethod && attempt <= 1) {
      console.log(`[Purchase] Attempt 1: TrxID=${trx_id} not found in SMS pool. Returning check warning.`);
      return NextResponse.json({
        success: false,
        notVerified: true,
        message: 'Transaction ID not verified yet. Please check again.'
      });
    }

    // ── Attempt 2 or Global: Create Payment record in DB (Approved or Pending) ──
    if (isApproved) {
      await Transaction.findByIdAndUpdate(matchingTx._id, { status: 'Matched' });
      console.log(`[Purchase] SMS Matched: TrxID=${trx_id} → Auto-Approve`);
    } else {
      console.log(`[Purchase] TrxID=${trx_id} not found. Creating Pending payment for admin review.`);
    }

    let targetLicenseId = null;
    if (licenseId) {
      const mongoose = (await import('mongoose')).default;
      if (mongoose.Types.ObjectId.isValid(licenseId)) {
        targetLicenseId = licenseId;
      } else {
        const LicenseModel = (await import('@/models/License')).default;
        const licDoc = await LicenseModel.findOne({ $or: [{ licenseKey: licenseId }, { api_key: licenseId }] });
        if (licDoc) targetLicenseId = licDoc._id;
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
      // Provision license
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
        : 'Payment received. Awaiting admin approval. You will be notified via email.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
