import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ThirdPartyKey from '@/models/ThirdPartyKey';

export async function GET() {
  try {
    await connectToDatabase();
    const keys = await ThirdPartyKey.find().sort({ createdAt: -1 });
    const now = new Date();
    
    // Dynamically evaluate and reset expired rpm intervals on the fly
    const processedKeys = await Promise.all(keys.map(async (key) => {
      if (now > new Date(key.reset_at)) {
        key.rpm_count = 0;
        // set next reset_at to the next full minute start boundary (e.g. 11:51:00)
        const nextReset = new Date();
        nextReset.setSeconds(0, 0);
        nextReset.setMinutes(nextReset.getMinutes() + 1);
        key.reset_at = nextReset;
        
        await ThirdPartyKey.updateOne(
          { _id: key._id },
          { $set: { rpm_count: 0, reset_at: nextReset } }
        );
      }
      return key;
    }));

    return NextResponse.json({ success: true, data: processedKeys });
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

export async function PATCH(request) {
  try {
    const { id, is_active } = await request.json();

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Missing id or is_active' }, { status: 400 });
    }

    await connectToDatabase();
    const updatedKey = await ThirdPartyKey.findByIdAndUpdate(id, { is_active }, { new: true });

    return NextResponse.json({ success: true, data: updatedKey });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
