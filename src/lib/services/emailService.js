import nodemailer from 'nodemailer';
import { SOFTWARE_DOWNLOAD_URL } from '@/lib/config/softwareConfig';

// Create Nodemailer Transporter using environment variables or default Gmail settings
const createTransporter = () => {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'stockmetapro@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'alrbthnpahrgbedj';

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });
};

async function getLatestDownloadLink() {
  return SOFTWARE_DOWNLOAD_URL;
}

/**
 * 1. Email for New Contributor Instant Payment Success
 */
export async function sendNewUserSuccessEmail({ to, userName, planName, credits, apiKey }) {
  try {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      console.log('[EmailService] SMTP credentials missing. Skipping email send.');
      return false;
    }

    const downloadLink = await getLatestDownloadLink();

    const transporter = createTransporter();
    const mailOptions = {
      from: `"StockMetaPro" <${user}>`,
      to: to,
      subject: `🎉 Welcome ${userName}! Account Creation Successful - StockMetaPro`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
            <h2 style="color: #2563eb; margin-top: 0;">Welcome ${userName}! 🎉</h2>
            <p style="font-size: 16px; color: #4b5563;">Your <strong>StockMetaPro</strong> contributor account has been created successfully!</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0;"><strong>Package Plan:</strong> ${planName}</p>
              <p style="margin: 5px 0;"><strong>Available Credits:</strong> ${credits}</p>
              <p style="margin: 5px 0;"><strong>Your License Key:</strong> <span style="font-family: monospace; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f172a; font-weight: bold;">${apiKey}</span></p>
            </div>

            <p style="font-size: 14px; color: #64748b;">You can now activate and use your license key in our desktop app.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
                📥 Download StockMetaPro App
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Need assistance? Reply directly to this email or contact support@stockmetapro.com</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] New User Success email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending New User email:', error.message);
    return false;
  }
}

/**
 * 2. Email for Active User Instant Renew Success
 */
export async function sendRenewUserSuccessEmail({ to, userName, planName, credits, apiKey, expireDate }) {
  try {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      console.log('[EmailService] SMTP credentials missing. Skipping email send.');
      return false;
    }

    const downloadLink = await getLatestDownloadLink();
    const transporter = createTransporter();
    const formattedExpire = expireDate ? new Date(expireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    const mailOptions = {
      from: `"StockMetaPro" <${user}>`,
      to: to,
      subject: `🎉 Account Successfully Renewed - StockMetaPro`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
            <h2 style="color: #16a34a; margin-top: 0;">Hello ${userName}! 🎉</h2>
            <p style="font-size: 16px; color: #4b5563;">Your <strong>StockMetaPro</strong> account subscription has been successfully renewed!</p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0;"><strong>Renewed Plan:</strong> ${planName}</p>
              <p style="margin: 5px 0;"><strong>New Credits Added:</strong> ${credits}</p>
              <p style="margin: 5px 0;"><strong>License Key:</strong> <span style="font-family: monospace; background: #dcfce7; padding: 2px 6px; border-radius: 4px; color: #14532d; font-weight: bold;">${apiKey}</span></p>
              <p style="margin: 5px 0;"><strong>New Expiry Date:</strong> ${formattedExpire}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadLink}" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
                📥 Download Latest StockMetaPro App
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Thank you for staying with StockMetaPro!</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Renew Success email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending Renew email:', error.message);
    return false;
  }
}

/**
 * 3. Email for Admin Approved Pending New User
 */
export async function sendNewUserPendingApprovedEmail({ to, userName, planName, credits, apiKey }) {
  try {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) return false;

    const downloadLink = await getLatestDownloadLink();
    const transporter = createTransporter();
    const mailOptions = {
      from: `"StockMetaPro" <${user}>`,
      to: to,
      subject: `✅ Payment Verified & Account Activated - StockMetaPro`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
            <h2 style="color: #2563eb; margin-top: 0;">Welcome ${userName}! 🎉</h2>
            <p style="font-size: 16px; color: #4b5563;">Great news! Your payment has been manually verified by our team, and your account is now fully activated!</p>
            
            <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0;"><strong>Activated Plan:</strong> ${planName}</p>
              <p style="margin: 5px 0;"><strong>Credits Included:</strong> ${credits}</p>
              <p style="margin: 5px 0;"><strong>Your License Key:</strong> <span style="font-family: monospace; background: #dbeafe; padding: 2px 6px; border-radius: 4px; color: #1e40af; font-weight: bold;">${apiKey}</span></p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
                📥 Download StockMetaPro App
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">StockMetaPro Team</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin Approved New User email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending Pending Approved New User email:', error.message);
    return false;
  }
}

/**
 * 4. Email for Admin Approved Pending Renew User
 */
export async function sendRenewUserPendingApprovedEmail({ to, userName, planName, credits, apiKey, expireDate }) {
  try {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) return false;

    const downloadLink = await getLatestDownloadLink();
    const transporter = createTransporter();
    const formattedExpire = expireDate ? new Date(expireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    const mailOptions = {
      from: `"StockMetaPro" <${user}>`,
      to: to,
      subject: `✅ Renewal Payment Verified & Subscription Active - StockMetaPro`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e1e8ed;">
            <h2 style="color: #16a34a; margin-top: 0;">Hello ${userName}! 🎉</h2>
            <p style="font-size: 16px; color: #4b5563;">Your pending renewal payment has been verified and approved by admin!</p>
            
            <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0;"><strong>Renewed Plan:</strong> ${planName}</p>
              <p style="margin: 5px 0;"><strong>Updated Credits:</strong> ${credits}</p>
              <p style="margin: 5px 0;"><strong>License Key:</strong> <span style="font-family: monospace; background: #dcfce7; padding: 2px 6px; border-radius: 4px; color: #14532d; font-weight: bold;">${apiKey}</span></p>
              <p style="margin: 5px 0;"><strong>New Expiry Date:</strong> ${formattedExpire}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${downloadLink}" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; display: inline-block;">
                📥 Download StockMetaPro App
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">StockMetaPro Team</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin Approved Renew User email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending Pending Approved Renew email:', error.message);
    return false;
  }
}
