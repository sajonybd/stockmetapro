import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import License from '@/models/License';

// Check auth (can be handled by middleware, but good to ensure db connection)
export async function GET() {
  try {
    await connectToDatabase();
    const licenses = await License.find().populate('userId', 'name email mobile').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: licenses });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { credit_limit, duration_days, name, email, mobile } = await request.json();

    if (!credit_limit || !duration_days) {
      return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
    }

    await connectToDatabase();

    let userId = null;

    if (email || mobile) {
      const User = (await import('@/models/User')).default;
      
      // Look up existing user by email or mobile
      let user = await User.findOne({
        $or: [
          ...(email ? [{ email: email.toLowerCase().trim() }] : []),
          ...(mobile ? [{ mobile: mobile.trim() }] : [])
        ]
      });

      if (user) {
        // Enforce 1 User (Email/Mobile) = 1 License Key rule
        // Check if this existing user already has a license linked to their account
        const existingLicense = await License.findOne({ userId: user._id });
        if (existingLicense) {
          return NextResponse.json({ 
            success: false, 
            message: `This User (Mobile/Email) already has an active license key: ${existingLicense.licenseKey || existingLicense.api_key}` 
          }, { status: 400 });
        }
        
        // If user exists but has no license, update name and mobile if provided
        if (name) user.name = name.trim();
        if (mobile) user.mobile = mobile.trim();
        await user.save();
      } else {
        // Create new user profile with a placeholder hashed password
        user = await User.create({
          name: name ? name.trim() : 'Manual Client',
          email: email ? email.toLowerCase().trim() : `admin_gen_${Date.now()}@stockmetapro.com`,
          mobile: mobile ? mobile.trim() : undefined,
          password: 'manual_gen_hashed_placeholder_123', // Dummy password
          role: 'user'
        });
      }
      userId = user._id;
    }

    // Generate random string key using SMPBD-XXXXX-XXXXX-XXXXX format
    const { generateLicenseKey } = await import('@/lib/services/licenseService');
    const api_key = generateLicenseKey();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + parseInt(duration_days, 10));
    
    const newLicense = await License.create({
      api_key,
      credit_limit: parseInt(credit_limit, 10),
      currentCredits: parseInt(credit_limit, 10),
      duration_days: parseInt(duration_days, 10),
      userId,
      status: 'Active',
      activation_date: new Date(),
      expire_date: expiry,
      expiresAt: expiry
    });

    const populatedLicense = await License.findById(newLicense._id).populate('userId', 'name email mobile');

    // Send notification email to user if email was provided
    if (email && email.trim()) {
      try {
        const { sendNewUserSuccessEmail } = await import('@/lib/services/emailService');
        await sendNewUserSuccessEmail({
          to: email.toLowerCase().trim(),
          userName: name ? name.trim() : 'Valued Client',
          planName: `Custom Plan (${credit_limit} Credits)`,
          credits: parseInt(credit_limit, 10),
          apiKey: api_key
        });
        console.log(`[Admin Manual Key Create] Notification email sent to ${email}`);
      } catch (emailErr) {
        console.error('[Admin Manual Key Create] Failed sending email:', emailErr.message);
      }
    }

    return NextResponse.json({ success: true, data: populatedLicense });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, action, status, credit_limit, expire_date, name, email, mobile, pc_build_number } = await request.json();
    
    await connectToDatabase();
    const license = await License.findById(id).populate('userId');
    if (!license) return NextResponse.json({ success: false, message: 'License not found' }, { status: 404 });

    if (action === 'toggle_status') {
      license.status = status;
    } else if (action === 'edit') {
      if (credit_limit !== undefined) license.credit_limit = parseInt(credit_limit, 10);
      if (expire_date !== undefined) license.expire_date = expire_date ? new Date(expire_date) : null;
      if (pc_build_number !== undefined) license.pc_build_number = pc_build_number || null;

      // Update associated User details if linked
      if (license.userId) {
        const User = (await import('@/models/User')).default;
        const userUpdates = {};
        if (name !== undefined) userUpdates.name = name;
        if (email !== undefined) userUpdates.email = email;
        if (mobile !== undefined) userUpdates.mobile = mobile;
        
        await User.findByIdAndUpdate(license.userId._id, { $set: userUpdates });
      }
    }
    
    await license.save();
    return NextResponse.json({ success: true, message: 'License and User details updated successfully' });
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
    const license = await License.findById(id);
    if (license) {
      if (license.userId) {
        const User = (await import('@/models/User')).default;
        await User.findByIdAndDelete(license.userId);
      }
      await License.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true, message: 'License and associated user account deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
