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
    
    // Automatic API Key Invalidation Trigger
    const isApiKeyError = error_type.toLowerCase().includes('api') || 
                           (message && (message.toLowerCase().includes('api_key') || 
                                        message.toLowerCase().includes('api key') || 
                                        message.toLowerCase().includes('invalid key') ||
                                        message.toLowerCase().includes('key is invalid') ||
                                        message.toLowerCase().includes('key not found') ||
                                        message.toLowerCase().includes('api key expired') ||
                                        message.toLowerCase().includes('deleted')));
    if (isApiKeyError && message) {
      // Find matches of key pattern like AIzaSy... (Gemini) or sk-... (OpenAI) inside error message
      const keyPattern = /(AIzaSy[A-Za-z0-9_-]{33}|sk-[A-Za-z0-9]{32,})/i;
      const matched = message.match(keyPattern);
      if (matched && matched[0]) {
        const foundKey = matched[0];
        // Flag key in database as Invalid
        const ThirdPartyKey = (await import('@/models/ThirdPartyKey')).default;
        await ThirdPartyKey.updateOne(
          { api_key: foundKey },
          { $set: { original_status: 'Invalid' } }
        );
      }
    }
    
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
