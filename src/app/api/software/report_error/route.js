import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SoftwareError from '@/models/SoftwareError';

// In-memory rate limiting map
// Key: license_key, Value: { count: number, resetTime: number }
const rateLimitMap = new Map();

export async function POST(request) {
  try {
    const data = await request.json();
    const { license_key, pc_build_number, error_type, file_name, message, app_version, occurred_at } = data;

    if (!license_key || !error_type) {
      return NextResponse.json({ success: false, message: 'Missing required fields: license_key and error_type' }, { status: 400 });
    }

    // Rate Limiting Logic: Max 10 requests per minute per license_key
    const now = Date.now();
    const limitWindow = 60 * 1000; // 1 minute
    const maxRequests = 10;

    let rateData = rateLimitMap.get(license_key);
    
    if (!rateData || now > rateData.resetTime) {
      // Initialize or reset window
      rateLimitMap.set(license_key, { count: 1, resetTime: now + limitWindow });
    } else {
      rateData.count++;
      if (rateData.count > maxRequests) {
        return NextResponse.json({ success: false, message: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      }
      rateLimitMap.set(license_key, rateData);
    }

    // Sanitize message to prevent XSS
    const sanitizedMessage = message ? message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;') : '';

    await connectToDatabase();
    
    const newErrorLog = await SoftwareError.create({
      license_key,
      pc_build_number,
      error_type,
      file_name,
      message: sanitizedMessage,
      app_version,
      occurred_at: occurred_at ? new Date(occurred_at) : new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/software/report_error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
