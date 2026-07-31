import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Package from '@/models/Package';

export async function POST(request) {
  const userId = request.cookies.get('user_session')?.value;
  
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { packageId, licenseId, name, email, mobile, payment_method, trx_id } = await request.json();

    if (!packageId || !name || !email || !mobile || !payment_method || !trx_id) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return NextResponse.json({ success: false, message: 'Invalid package selected' }, { status: 400 });
    }

    const newPayment = await Payment.create({
      userId,
      packageId,
      licenseId: licenseId || null,
      name,
      email,
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
