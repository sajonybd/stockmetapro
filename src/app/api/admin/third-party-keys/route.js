import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ThirdPartyKey from '@/models/ThirdPartyKey';

export async function GET() {
  try {
    await connectToDatabase();
    const keys = await ThirdPartyKey.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: keys });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { service_name, api_key } = await request.json();

    if (!service_name || !api_key) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();
    const newKey = await ThirdPartyKey.create({ service_name, api_key });

    return NextResponse.json({ success: true, data: newKey });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing id' }, { status: 400 });
    }

    await connectToDatabase();
    await ThirdPartyKey.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Key deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
