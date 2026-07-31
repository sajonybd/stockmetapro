import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ReportedApiKey from '@/models/ReportedApiKey';
import ApiLog from '@/models/ApiLog';

async function logApi(requestPayload, responsePayload, statusCode) {
  try {
    await ApiLog.create({
      endpoint: '/api/software/report_user_api_key',
      method: 'POST',
      request_payload: requestPayload,
      response_payload: responsePayload,
      status_code: statusCode,
    });
  } catch (e) {
    console.error('Failed to log API:', e);
  }
}

export async function POST(request) {
  let requestPayload = {};
  try {
    requestPayload = await request.json();
    const { license_key, pc_build_number, api_key, status, reported_at } = requestPayload;

    if (!license_key || !api_key) {
      const response = { success: false };
      await logApi(requestPayload, response, 400);
      return NextResponse.json(response);
    }

    await connectToDatabase();

    const existing = await ReportedApiKey.findOne({ license_key, api_key });
    if (!existing) {
      await ReportedApiKey.create({
        license_key,
        pc_build_number: pc_build_number || 'Unknown',
        api_key,
        status: status || 'Active',
        reported_at: reported_at ? new Date(reported_at) : new Date(),
      });
    }

    const response = { success: true };
    await logApi(requestPayload, response, 200);
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error in report_user_api_key:', error);
    const errorResponse = { success: false };
    await logApi(requestPayload, errorResponse, 500);
    return NextResponse.json(errorResponse);
  }
}
