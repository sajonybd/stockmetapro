import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';

export async function GET() {
  try {
    await connectToDatabase();
    
    const now = new Date();
    const result = await License.updateMany(
      {
        $or: [
          { expiresAt: { $lt: now } },
          { expire_date: { $lt: now } }
        ],
        status: { $in: ['Active', 'active'] }
      },
      {
        $set: {
          status: 'Expired',
          currentCredits: 0
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Cleaned up expired licenses.',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Cron Cleanup Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
