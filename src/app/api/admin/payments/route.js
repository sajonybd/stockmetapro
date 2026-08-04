import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import License from '@/models/License';
import Package from '@/models/Package';
import User from '@/models/User';
import { cookies } from 'next/headers';

const checkAuth = async () => {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return adminSession && adminSession.value === 'authenticated';
};

// ... GET method remains unchanged ...
export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('packageId', 'name credit_limit price_tk duration_days')
      .populate('licenseId', 'api_key status')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await checkAuth())) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const { paymentId, action } = await request.json();
    await connectToDatabase();

    const payment = await Payment.findById(paymentId).populate('packageId');
    if (!payment) return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
    if (payment.status !== 'Pending') return NextResponse.json({ success: false, message: 'Already processed' }, { status: 400 });

    if (action === 'Reject') {
      payment.status = 'Rejected';
      await payment.save();

      // Clean up any temporary User record created so email/mobile is freed for new account
      const User = (await import('@/models/User')).default;
      const License = (await import('@/models/License')).default;

      const user = await User.findOne({
        $or: [
          ...(payment.email ? [{ email: payment.email.toLowerCase().trim() }] : []),
          ...(payment.mobile ? [{ mobile: payment.mobile.trim() }] : [])
        ]
      });

      if (user) {
        const hasLicense = await License.findOne({ userId: user._id });
        if (!hasLicense) {
          await User.findByIdAndDelete(user._id);
        }
      }

      return NextResponse.json({ success: true, message: 'Payment rejected and account freed.' });
    }

    if (action === 'Block') {
      payment.status = 'Blocked';
      await payment.save();
      const BlockedUser = (await import('@/models/BlockedUser')).default;
      await BlockedUser.create({
        name: payment.name || '',
        email: payment.email || '',
        mobile: payment.mobile || '',
        reason: 'Blocked via payment rejection'
      });
      return NextResponse.json({ success: true, message: 'User added to Blocked List and payment blocked' });
    }

    if (action === 'Approve') {
      const { renewOrPurchaseLicense } = await import('@/lib/services/licenseService.js');
      
      const result = await renewOrPurchaseLicense({
        identifier: payment.licenseId ? payment.licenseId.toString() : payment.email || payment.mobile,
        packageId: payment.packageId._id,
        paymentProvider: payment.payment_method ? payment.payment_method.toLowerCase() : 'bkash',
        trxId: payment.trx_id,
        amountPaid: payment.amount || 0,
        userName: payment.name,
        userEmail: payment.email,
        userMobile: payment.mobile,
      });

      payment.status = 'Approved';
      if (!payment.licenseId && result.license) {
        payment.licenseId = result.license._id;
      }
      await payment.save();

      console.log('====== EMAIL SENT TO:', payment.email, '======');
      console.log('Subject: StockMetaPro - Payment Approved & License Details');
      console.log(`License Key: ${result.license.licenseKey || result.license.api_key}\nMessage: ${result.message}`);
      console.log('==================================================');

      return NextResponse.json({ success: true, message: result.message });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
