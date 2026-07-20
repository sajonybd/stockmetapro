import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import License from '@/models/License';
import Package from '@/models/Package';
import { cookies } from 'next/headers';

const checkAuth = async () => {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return adminSession && adminSession.value === 'authenticated';
};

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
    const { paymentId, action } = await request.json(); // action: 'Approve' or 'Reject'
    await connectToDatabase();

    const payment = await Payment.findById(paymentId).populate('packageId');
    if (!payment) return NextResponse.json({ success: false, message: 'Payment not found' }, { status: 404 });
    if (payment.status !== 'Pending') return NextResponse.json({ success: false, message: 'Already processed' }, { status: 400 });

    if (action === 'Reject') {
      payment.status = 'Rejected';
      await payment.save();
      return NextResponse.json({ success: true, message: 'Payment rejected' });
    }

    if (action === 'Approve') {
      const pkg = payment.packageId;
      
      if (payment.licenseId) {
        // Renewal Flow
        const existingLicense = await License.findById(payment.licenseId);
        if (existingLicense) {
          existingLicense.credit_limit = pkg.credit_limit; // Reset to package limit
          existingLicense.credits_used = 0; // Reset usage
          existingLicense.duration_days = pkg.duration_days;
          
          // Add time to expire_date if it was activated
          if (existingLicense.expire_date) {
            const newExpireDate = new Date(existingLicense.expire_date);
            if (newExpireDate < new Date()) {
              // It was already expired, start from today
              newExpireDate.setTime(new Date().getTime());
            }
            newExpireDate.setDate(newExpireDate.getDate() + pkg.duration_days);
            existingLicense.expire_date = newExpireDate;
            existingLicense.status = 'Active'; // Re-activate if it was expired
          }
          await existingLicense.save();
        }
      } else {
        // New License Flow
        const api_key = 'SK-' + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
        await License.create({
          api_key,
          credit_limit: pkg.credit_limit,
          duration_days: pkg.duration_days,
          userId: payment.userId,
        });
      }

      payment.status = 'Approved';
      await payment.save();
      return NextResponse.json({ success: true, message: 'Payment approved and license generated/renewed' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
