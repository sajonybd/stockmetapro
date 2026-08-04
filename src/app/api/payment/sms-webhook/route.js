import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Payment from '@/models/Payment';
import License from '@/models/License';

// Webhook to receive incoming SMS notifications from httpSMS
export async function POST(request) {
  try {
    const payload = await request.json();
    console.log('[SMS Webhook Received Payload]:', JSON.stringify(payload, null, 2));

    // httpSMS format sends event details under request body
    const messageText = payload.data?.content || payload.message || '';
    const sender = payload.data?.from || payload.sender || '';

    if (!messageText) {
      return NextResponse.json({ success: false, message: 'Empty message body' }, { status: 400 });
    }

    // RegEx patterns for bKash & Nagad Cash In / Send Money
    // Examples: 
    // bKash: You have received Tk 1000.00 from 01700000000. Ref 1. Fee Tk 0.00. Balance Tk 5000.00. TrxID BLK9A1B2C3 at 02/08/2026 20:00
    // Nagad: Cash In Tk 1,000.00 from 01700000000 successful. Fee Tk 0.00. Balance Tk 5,000.00. TrxID: 71XYZ999 at 2026-08-02 20:00:00
    
    let amount = 0;
    let trxId = '';
    let provider = '';

    // 1. Process bKash Format
    if (sender.toLowerCase().includes('bkash') || messageText.toLowerCase().includes('bkash')) {
      provider = 'bkash';
      const amountMatch = messageText.match(/(?:received|cash in|send money)\s+tk\s*([\d,.]+)/i);
      const trxMatch = messageText.match(/TrxID\s+([A-Z0-9]+)/i);
      if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      if (trxMatch) trxId = trxMatch[1].trim();
    } 
    // 2. Process Nagad Format
    else if (sender.toLowerCase().includes('nagad') || messageText.toLowerCase().includes('nagad')) {
      provider = 'nagad';
      const amountMatch = messageText.match(/(?:received|cash in|send money)\s+tk\s*([\d,.]+)/i);
      const trxMatch = messageText.match(/TrxID:\s*([A-Z0-9]+)/i);
      if (amountMatch) amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      if (trxMatch) trxId = trxMatch[1].trim();
    }

    // Fallback regex if name headers are missing
    if (!trxId) {
      const genericTrxMatch = messageText.match(/TrxID\s*[:\s]\s*([A-Z0-9]+)/i);
      if (genericTrxMatch) trxId = genericTrxMatch[1].trim();
    }

    if (!trxId || !amount) {
      console.log('[SMS Webhook warning]: Could not parse Transaction ID or Amount from message text:', messageText);
      return NextResponse.json({ success: true, message: 'Message ignored (Not a valid payment SMS format)' });
    }

    await connectToDatabase();

    // Check if transaction already exists in DB to prevent duplicate credits
    const existingTx = await Transaction.findOne({ trxId });
    if (existingTx) {
      return NextResponse.json({ success: true, message: 'Transaction already processed' });
    }

    // Save transaction to local db pool
    const newTx = await Transaction.create({
      trxId,
      amountPaid: amount,
      paymentProvider: provider || 'manual',
      type: 'NEW_PURCHASE',
      creditsAdded: 0,
      creditsRolledOver: 0,
      totalCreditsAfter: 0,
      newExpiry: new Date(),
      status: 'Unused' // Custom tag to match later
    });

    console.log(`[SMS Webhook Success]: Parsed Tx ${trxId} - Amount ${amount} Tk. Saved to Pool.`);

    // Auto-approve pending payments waiting for this TrxID
    const pendingPayment = await Payment.findOne({ trx_id: trxId, status: 'Pending' });
    if (pendingPayment) {
      // Execute Auto-Approval logic here
      pendingPayment.status = 'Approved';
      await pendingPayment.save();

      // Check if Renewal or New License
      if (pendingPayment.licenseId) {
        const license = await License.findById(pendingPayment.licenseId);
        if (license) {
          license.status = 'Active';
          license.credit_limit += 1000; // Increment credits on auto-approve
          const currentExpiry = new Date(license.expire_date);
          currentExpiry.setDate(currentExpiry.getDate() + 30);
          license.expire_date = currentExpiry;
          await license.save();
        }
      } else {
        // Create new active license
        const api_key = 'SK-' + Math.random().toString(36).substring(2, 15).toUpperCase();
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);

        await License.create({
          api_key,
          userId: pendingPayment.userId,
          packageId: pendingPayment.packageId,
          credit_limit: 1000,
          currentCredits: 1000,
          duration_days: 30,
          status: 'Active',
          expire_date: expiry,
          activation_date: new Date()
        });
      }
      console.log(`[SMS Webhook Auto-Approved]: Payment with TrxID ${trxId} was automatically approved.`);
    }

    return NextResponse.json({ success: true, message: 'Transaction recorded successfully', data: { trxId, amount } });
  } catch (error) {
    console.error('[SMS Webhook Error]:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
