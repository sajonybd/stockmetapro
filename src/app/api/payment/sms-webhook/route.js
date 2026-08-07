import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Payment from '@/models/Payment';
import License from '@/models/License';

// -----------------------------------------------------------------------
// Webhook: receives SMS from the custom StockMeta SMS Forwarder Android app
// Custom App Payload format:
//   { secret_key, sender, message, sim_slot, timestamp }
// -----------------------------------------------------------------------

export async function POST(request) {
  try {
    const payload = await request.json();
    console.log('[SMS Webhook] Received payload:', JSON.stringify(payload, null, 2));

    // secret_key is accepted but NOT strictly enforced — webhook processes regardless
    const incomingSecret = payload.secret_key || request.headers.get('X-Secret-Key') || '';
    if (incomingSecret) {
      console.log(`[SMS Webhook] Secret key supplied: ${incomingSecret}`);
    }

    const messageText = payload.message || '';
    const sender = payload.sender || '';

    if (!messageText) {
      // Return 200 OK so the Android app knows we received the empty call and won't retry forever
      return NextResponse.json({ success: true, message: 'Received empty message body' }, { status: 200 });
    }

    // Payment Provider Detection based on sender name & message content
    const msgLower = messageText.toLowerCase();
    const senderLower = sender.toLowerCase();

    const isBkash = senderLower.includes('bkash') || msgLower.includes('bkash');
    const isNagad = senderLower.includes('nagad') || msgLower.includes('nagad');
    const isRocket = senderLower.includes('rocket') || msgLower.includes('rocket') || msgLower.includes('dutch-bangla') || msgLower.includes('dbbl');

    if (!isBkash && !isNagad && !isRocket) {
      console.log(`[SMS Webhook] Ignored non-payment SMS from "${sender}"`);
      return NextResponse.json({
        success: true,
        message: 'Message received but not a recognized payment SMS — ignored'
      });
    }

    let amount = 0;
    let trxId = '';
    let provider = '';

    // Regex parsing for bKash, Nagad, and Rocket
    if (isBkash) {
      provider = 'bkash';
      const amountMatch = messageText.match(/(?:received|cash\s*in|send\s*money)\s+tk\s*([0-9,]+(?:\.[0-9]+)?)/i);
      const trxMatch = messageText.match(/TrxID\s+([A-Z0-9]+)/i);
      if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      if (trxMatch) trxId = trxMatch[1].trim();
    } else if (isNagad) {
      provider = 'nagad';
      const amountMatch = messageText.match(/(?:received|cash\s*in|send\s*money)\s+tk\s*([0-9,]+(?:\.[0-9]+)?)/i);
      const trxMatch = messageText.match(/TrxID[:\s]+([A-Z0-9]+)/i);
      if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      if (trxMatch) trxId = trxMatch[1].trim();
    } else if (isRocket) {
      provider = 'rocket';
      const amountMatch = messageText.match(/(?:received|cash\s*in|send\s*money)\s+(?:tk|bdt)\s*([0-9,]+(?:\.[0-9]+)?)/i);
      const trxMatch = messageText.match(/(?:TxnId|Transaction\s*ID|TrxID)[:\s]+([A-Z0-9]+)/i);
      if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      if (trxMatch) trxId = trxMatch[1].trim();
    }

    // Generic fallback if specific regex missed it
    if (!trxId) {
      const fallbackTrx = messageText.match(/(?:TrxID|TxnId|Transaction\s*ID)[:\s]+([A-Z0-9]+)/i);
      if (fallbackTrx) trxId = fallbackTrx[1].trim();
    }

    if (!trxId || !amount) {
      console.log('[SMS Webhook] Could not parse TrxID or Amount. Message:', messageText);
      return NextResponse.json({
        success: true,
        message: 'Payment SMS received but could not extract TrxID/Amount'
      });
    }

    await connectToDatabase();

    // Prevent duplicate processing of the same transaction
    const existingTx = await Transaction.findOne({ trxId });
    if (existingTx) {
      return NextResponse.json({
        success: true,
        message: 'Transaction already processed',
        data: { trxId, amount }
      });
    }

    // Save transaction to the pool as Unused by default
    const newTx = await Transaction.create({
      trxId,
      amountPaid: amount,
      paymentProvider: provider,
      type: 'NEW_PURCHASE',
      creditsAdded: 0,
      creditsRolledOver: 0,
      totalCreditsAfter: 0,
      newExpiry: new Date(),
      status: 'Unused'
    });

    console.log(`[SMS Webhook] Saved Transaction: ${provider.toUpperCase()} TrxID=${trxId} Amount=${amount} Tk`);

    // Check if there is already a Pending user payment waiting for this TrxID
    const pendingPayment = await Payment.findOne({ trx_id: trxId, status: 'Pending' });
    if (pendingPayment) {
      const expectedAmount = pendingPayment.amount;
      const tolerance = 2; // ±2 Tk tolerance
      const amountOk = amount >= (expectedAmount - tolerance);

      if (!amountOk) {
        console.warn(`[SMS Webhook] Amount mismatch! SMS=${amount} Tk, Expected=${expectedAmount} Tk. Setting status to AmountMismatch.`);
        await Transaction.findOneAndUpdate({ trxId }, { status: 'AmountMismatch' });
        return NextResponse.json({
          success: true,
          message: `Amount mismatch: SMS shows ${amount} Tk but subscription requires ${expectedAmount} Tk`
        });
      }

      // Amount matches! Approve Payment and update Transaction status
      pendingPayment.status = 'Approved';
      await pendingPayment.save();

      await Transaction.findOneAndUpdate({ trxId }, { status: 'Matched' });

      // Automatically extend/provision license
      if (pendingPayment.licenseId) {
        // Renewal
        const license = await License.findById(pendingPayment.licenseId);
        if (license) {
          const Package = (await import('@/models/Package')).default;
          const selectedPackage = await Package.findById(pendingPayment.packageId);
          const daysToAdd = selectedPackage ? selectedPackage.duration_days : 30;
          const creditsToAdd = selectedPackage ? selectedPackage.credit_limit : 1000;

          license.status = 'Active';
          license.credit_limit += creditsToAdd;
          const currentExpiry = new Date(license.expire_date || new Date());
          currentExpiry.setDate(currentExpiry.getDate() + daysToAdd);
          license.expire_date = currentExpiry;
          license.expiresAt = currentExpiry;
          await license.save();
        }
      } else {
        // New License
        const Package = (await import('@/models/Package')).default;
        const selectedPackage = await Package.findById(pendingPayment.packageId);
        const days = selectedPackage ? selectedPackage.duration_days : 30;
        const credits = selectedPackage ? selectedPackage.credit_limit : 1000;

        const { generateLicenseKey } = await import('@/lib/services/licenseService');
        const api_key = generateLicenseKey();
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);

        await License.create({
          api_key,
          userId: pendingPayment.userId,
          packageId: pendingPayment.packageId,
          credit_limit: credits,
          currentCredits: credits,
          duration_days: days,
          status: 'Active',
          expire_date: expiry,
          expiresAt: expiry,
          activation_date: new Date()
        });
      }
      console.log(`[SMS Webhook] Auto-Approved pending payment for TrxID=${trxId}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction recorded successfully',
      data: { trxId, amount, provider }
    });

  } catch (error) {
    console.error('[SMS Webhook Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
