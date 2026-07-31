import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';
import ApiLog from '@/models/ApiLog';

async function logApi(requestPayload, responsePayload, statusCode) {
  try {
    await ApiLog.create({
      endpoint: '/api/software/verify_license',
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
    const { license_key, pc_build_number } = requestPayload;

    if (!license_key) {
      const response = { success: false, message: 'Wrong License', license_status: 'Invalid' };
      await logApi(requestPayload, response, 400);
      return NextResponse.json(response);
    }

    await connectToDatabase();

    const license = await License.findOne({ api_key: license_key }).populate('userId').populate('packageId');

    if (!license) {
      const response = { success: false, message: 'Wrong License', license_status: 'Invalid' };
      await logApi(requestPayload, response, 403);
      return NextResponse.json(response);
    }

    if (license.status === 'Revoked' || license.status === 'Disabled') {
      const response = { success: false, message: 'License disabled', license_status: 'Disabled' };
      await logApi(requestPayload, response, 403);
      return NextResponse.json(response);
    }

    if (!license.activation_date) {
      license.activation_date = new Date();
      const newExpireDate = new Date();
      newExpireDate.setDate(newExpireDate.getDate() + license.duration_days);
      license.expire_date = newExpireDate;
      await license.save();
    }

    if (new Date() > license.expire_date) {
      const response = { success: false, message: 'License expired', license_status: 'Expired' };
      await logApi(requestPayload, response, 403);
      return NextResponse.json(response);
    }

    if (pc_build_number) {
      if (!license.pc_build_number) {
        license.pc_build_number = pc_build_number;
        await license.save();
      } else if (license.pc_build_number !== pc_build_number) {
        const response = { success: false, message: 'Wrong License', license_status: 'Invalid' };
        await logApi(requestPayload, response, 403);
        return NextResponse.json(response);
      }
    }

    const successResponse = {
      success: true,
      username: license.userId?.name || 'Admin',
      plan_name: license.packageId?.name || 'Custom Plan',
      license_status: 'Active',
      credit_limit: license.credit_limit,
      credits_used: license.credits_used || 0,
      credits_remaining: license.credit_limit - (license.credits_used || 0),
      duration_days: license.duration_days,
      activation_date: license.activation_date,
      expire_date: license.expire_date,
    };
    
    await logApi(requestPayload, successResponse, 200);
    return NextResponse.json(successResponse);
    
  } catch (error) {
    console.error('API Error:', error);
    const errorResponse = { success: false, message: 'Server error', license_status: 'Invalid' };
    await logApi(requestPayload, errorResponse, 500);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
