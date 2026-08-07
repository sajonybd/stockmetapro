import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Package from '@/models/Package';
import Transaction from '@/models/Transaction';
import License from '@/models/License';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { generateLicenseKey } from '@/lib/services/licenseService';
import { sendNewUserSuccessEmail, sendRenewUserSuccessEmail } from '@/lib/services/emailService';

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
      userId = new mongoose.Types.ObjectId().toString();
    }

    if (!packageId || !name || !email || !mobile || !payment_method || !trx_id) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if Email or Mobile is already registered by another user
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { mobile: mobile.trim() }
      ]
    });

    if (existingUser) {
      // Reuse existing user's ID for re-attempts or renewals
      userId = existingUser._id.toString();
    }

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return NextResponse.json({ success: false, message: 'Invalid package selected' }, { status: 400 });
    }

    // Determine if this is a global payment method (Payoneer/Skrill — no SMS verification needed)
    const isGlobalMethod = bypass_sms === true || ['Payoneer', 'Skrill'].includes(payment_method);

    // Look for matching SMS transaction in the pool with whitespace tolerance and regex escaping
    const searchTrxId = trx_id.trim();
    const escapedTrxId = searchTrxId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expectedAmount = currency === 'USD' ? selectedPackage.price_usd : selectedPackage.price_tk;

    let matchingTx = null;
    if (!isGlobalMethod) {
      const candidateTx = await Transaction.findOne({ 
        trxId: { $regex: new RegExp(`^\\s*${escapedTrxId}\\s*$`, 'i') },
        $or: [
          { status: { $regex: /^unused$/i } },
          { status: { $exists: false } },
          { status: null }
        ]
      });

      if (candidateTx) {
        const txAmount = candidateTx.amountPaid || candidateTx.amount || 0;
        const amountDiff = Math.abs(txAmount - expectedAmount);
        // Allow auto-approval if amount matches or if amount was not set on manual/test transaction
        if (!txAmount || amountDiff <= 2) {
          matchingTx = candidateTx;
        } else {
          console.log(`[Purchase] Amount Mismatch! Candidate TrxID=${searchTrxId} has Amount=${txAmount}, expected ${expectedAmount}`);
        }
      }
    }

    const isApproved = !!matchingTx;

    // ── Attempt 1 (Local BDT): If not found in SMS pool, fail immediately without saving to DB ──
    if (!isApproved && !isGlobalMethod && attempt <= 1) {
      return NextResponse.json({
        success: false,
        notVerified: true,
        message: 'Transaction ID not verified yet. Please check again.'
      });
    }

    // ── Attempt 2 or Global: Create Payment record in DB (Approved or Pending) ──
    if (isApproved) {
      await Transaction.findByIdAndUpdate(matchingTx._id, { status: 'Matched' });
    }

    let targetLicenseId = null;
    if (licenseId) {
      if (mongoose.Types.ObjectId.isValid(licenseId)) {
        targetLicenseId = licenseId;
      } else {
        const licDoc = await License.findOne({ $or: [{ licenseKey: licenseId }, { api_key: licenseId }] });
        if (licDoc) targetLicenseId = licDoc._id;
      }
    }

    // Ensure User record is created/updated so License and Payment are properly bound
    const userOrConditions = [];
    if (email && email.trim()) userOrConditions.push({ email: email.toLowerCase().trim() });
    if (mobile && mobile.trim()) userOrConditions.push({ mobile: mobile.trim() });
    if (userId && mongoose.Types.ObjectId.isValid(userId)) userOrConditions.push({ _id: userId });

    let userDoc = null;
    if (userOrConditions.length > 0) {
      userDoc = await User.findOne({ $or: userOrConditions });
    }

    if (!userDoc) {
      const defaultPasswordHash = await bcrypt.hash('123456', 10);
      userDoc = await User.create({
        name: name || 'User',
        email: (email || '').toLowerCase().trim(),
        mobile: (mobile || '').trim(),
        password: defaultPasswordHash,
        role: 'user'
      });
    } else {
      userDoc.name = name || userDoc.name;
      if (email && email.trim()) userDoc.email = email.toLowerCase().trim();
      if (mobile && mobile.trim()) userDoc.mobile = mobile.trim();
      await userDoc.save();
    }
    userId = userDoc._id.toString();

    const finalPaidAmount = isApproved && matchingTx?.amountPaid 
      ? matchingTx.amountPaid 
      : (amount || (currency === 'USD' ? selectedPackage.price_usd : selectedPackage.price_tk));

    const newPayment = await Payment.create({
      userId: userDoc._id,
      packageId,
      licenseId: targetLicenseId,
      name,
      email,
      mobile,
      payment_method,
      trx_id,
      amount: finalPaidAmount,
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

          // Send Active User Renew Email
          try {
            await sendRenewUserSuccessEmail({
              to: email,
              userName: name,
              planName: selectedPackage.name,
              credits: selectedPackage.credit_limit,
              apiKey: license.api_key || license.licenseKey,
              expireDate: currentExpiry
            });
            console.log(`[Purchase AutoApprove Email] Renew success email sent to ${email}`);
          } catch (emailErr) {
            console.error('[Purchase AutoApprove Email] Failed sending renew email:', emailErr.message);
          }
        }
      } else {
        const api_key = generateLicenseKey();
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + selectedPackage.duration_days);

        const newLicense = await License.create({
          api_key,
          licenseKey: api_key,
          userId: userDoc._id,
          packageId,
          credit_limit: selectedPackage.credit_limit,
          currentCredits: selectedPackage.credit_limit,
          duration_days: selectedPackage.duration_days,
          status: 'Active',
          expire_date: expiry,
          expiresAt: expiry,
          activation_date: new Date()
        });

        // Send New Contributor Success Email
        try {
          await sendNewUserSuccessEmail({
            to: email,
            userName: name,
            planName: selectedPackage.name,
            credits: selectedPackage.credit_limit,
            apiKey: api_key
          });
          console.log(`[Purchase AutoApprove Email] New user success email sent to ${email}`);
        } catch (emailErr) {
          console.error('[Purchase AutoApprove Email] Failed sending new user email:', emailErr.message);
        }
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
