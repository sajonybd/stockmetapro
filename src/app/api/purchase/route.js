import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Package from '@/models/Package';
import License from '@/models/License';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { packageId, licenseId, name, email, mobile, payment_method, trx_id, type } = await request.json();

    if (!packageId || !mobile || !payment_method || !trx_id) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return NextResponse.json({ success: false, message: 'Invalid package selected' }, { status: 400 });
    }

    // Verify existing user if renewal
    let userId = null;
    if (type === 'renew') {
      const user = await User.findOne({ mobile });
      if (!user) {
        return NextResponse.json({ success: false, message: 'No account exists with this mobile number.' }, { status: 404 });
      }
      userId = user._id;

      // Ensure they selected a valid license to renew
      if (!licenseId) {
        return NextResponse.json({ success: false, message: 'Must select a license to renew.' }, { status: 400 });
      }
      const license = await License.findById(licenseId);
      if (!license || license.userId.toString() !== user._id.toString()) {
        return NextResponse.json({ success: false, message: 'Invalid license selected for renewal.' }, { status: 400 });
      }
    }

    // If new user, just pass the form details, User will be created on Admin approval
    const newPayment = await Payment.create({
      userId: userId || undefined,
      packageId,
      licenseId: licenseId || null,
      name: name || (type === 'renew' ? 'Existing User' : ''), // For renew, admin sees 'Existing User' if name not provided
      email: email || (type === 'renew' ? 'existing@user.com' : ''), 
      mobile,
      payment_method,
      trx_id,
      amount: selectedPackage.price_tk,
    });

    return NextResponse.json({ success: true, data: newPayment });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Endpoint to fetch existing user's licenses by mobile number
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mobile = searchParams.get('mobile');

  if (!mobile) return NextResponse.json({ success: false, message: 'Mobile required' }, { status: 400 });

  try {
    await connectToDatabase();
    const user = await User.findOne({ mobile });
    if (!user) {
      return NextResponse.json({ success: false, message: 'No account exist with this number' }, { status: 404 });
    }

    const licenses = await License.find({ userId: user._id });
    return NextResponse.json({ success: true, user: { name: user.name, mobile: user.mobile }, licenses });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
