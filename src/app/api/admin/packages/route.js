import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Package from '@/models/Package';
import { cookies } from 'next/headers';

// Check auth
const checkAuth = async () => {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return adminSession && adminSession.value === 'authenticated';
};

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    await connectToDatabase();
    const packages = await Package.find().sort({ price_tk: 1 });
    return NextResponse.json({ success: true, data: packages });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await checkAuth())) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const { name, credit_limit, price_tk, price_usd, duration_days, is_popular } = await request.json();
    await connectToDatabase();
    const newPkg = await Package.create({ 
      name, 
      credit_limit, 
      price_tk, 
      price_usd: price_usd !== undefined ? parseFloat(price_usd) : (name === 'Pro' ? 1.0 : (name === 'Premium' ? 2.0 : 3.0)), 
      duration_days, 
      is_popular 
    });
    return NextResponse.json({ success: true, data: newPkg });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await checkAuth())) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await connectToDatabase();
    await Package.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Package deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!(await checkAuth())) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  try {
    const { id, name, credit_limit, price_tk, price_usd, duration_days, is_popular } = await request.json();
    await connectToDatabase();
    const pkg = await Package.findById(id);
    if (!pkg) return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });

    if (name) pkg.name = name;
    if (credit_limit) pkg.credit_limit = parseInt(credit_limit, 10);
    if (price_tk !== undefined) pkg.price_tk = parseInt(price_tk, 10);
    if (price_usd !== undefined) pkg.price_usd = parseFloat(price_usd);
    if (duration_days) pkg.duration_days = parseInt(duration_days, 10);
    if (is_popular !== undefined) pkg.is_popular = is_popular;

    await pkg.save();
    return NextResponse.json({ success: true, message: 'Package updated successfully', data: pkg });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
