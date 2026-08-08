import nodemailer from 'nodemailer';
import { SOFTWARE_DOWNLOAD_URL } from '@/lib/config/softwareConfig';

// Helper to get Gmail credentials with reliable fallback
const getCredentials = () => {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'stockmetapro@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'alrbthnpahrgbedj';
  return { user, pass };
};

// Create Nodemailer Transporter
const createTransporter = () => {
  const { user, pass } = getCredentials();
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });
};

async function getLatestDownloadLink() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stockmetapro.com';
  return `${baseUrl}/download`;
}

/**
 * Base HTML Template Wrapper for High Deliverability & Premium Aesthetics
 */
function buildEmailTemplate({ title, subtitle, mainBadge, contentHtml, downloadUrl }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f172a; padding:40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px; background:#1e293b; border-radius:16px; border:1px solid #334155; overflow:hidden; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding:32px 28px; text-align:center;">
              <div style="font-size:24px; font-weight:800; color:#ffffff; letter-spacing:1px; margin-bottom:6px;">
                ⚡ StockMetaPro
              </div>
              <div style="font-size:14px; color:#93c5fd; font-weight:500;">
                ${subtitle}
              </div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding:32px 28px;">
              <div style="text-align:center; margin-bottom:24px;">
                <span style="background:rgba(37,99,235,0.2); border:1px solid #3b82f6; color:#60a5fa; font-size:13px; font-weight:700; padding:6px 16px; border-radius:9999px; display:inline-block;">
                  ${mainBadge}
                </span>
              </div>

              ${contentHtml}

              <!-- Action Button -->
              <div style="text-align:center; margin:32px 0 24px 0;">
                <a href="${downloadUrl}" target="_blank" style="background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:10px; font-weight:700; font-size:15px; display:inline-block; box-shadow:0 4px 14px rgba(37,99,235,0.4);">
                  📥 Download StockMetaPro Desktop App
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0f172a; padding:20px 28px; border-top:1px solid #334155; text-align:center;">
              <p style="font-size:12px; color:#64748b; margin:0 0 6px 0;">
                This is an official transactional message from StockMetaPro Security Services.
              </p>
              <p style="font-size:12px; color:#475569; margin:0;">
                Need help? Contact support at <a href="mailto:stockmetapro@gmail.com" style="color:#3b82f6; text-decoration:none;">stockmetapro@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. Email for New Contributor Instant Payment Success
 */
export async function sendNewUserSuccessEmail({ to, userName, planName, credits, apiKey }) {
  try {
    const { user } = getCredentials();
    const downloadLink = await getLatestDownloadLink();
    const transporter = createTransporter();

    const htmlContent = buildEmailTemplate({
      title: `Welcome ${userName}! - StockMetaPro Account Active`,
      subtitle: `Official Contributor Account Notification`,
      mainBadge: `✓ ACCOUNT ACTIVATED & LICENSED`,
      downloadUrl: downloadLink,
      contentHtml: `
        <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin:0 0 12px 0; text-align:center;">Welcome aboard, ${userName}! 🎉</h2>
        <p style="color:#94a3b8; font-size:14px; line-height:1.6; margin:0 0 24px 0; text-align:center;">
          Your <strong>StockMetaPro</strong> contributor account has been created and verified. You can now use your license key below to activate the desktop app.
        </p>

        <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:20px; margin-bottom:24px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">Package Plan:</td>
              <td style="padding:6px 0; color:#38bdf8; font-size:14px; font-weight:700; text-align:right;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">Available Credits:</td>
              <td style="padding:6px 0; color:#4ade80; font-size:14px; font-weight:700; text-align:right;">${credits} Credits</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:16px; border-top:1px solid #1e293b;">
                <div style="color:#94a3b8; font-size:12px; font-weight:600; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">YOUR LICENSE KEY</div>
                <div style="background:#1e293b; border:1px solid #3b82f6; border-radius:8px; padding:12px; text-align:center; font-family:monospace; font-size:16px; font-weight:800; color:#60a5fa; letter-spacing:1.5px;">
                  ${apiKey}
                </div>
              </td>
            </tr>
          </table>
        </div>
      `
    });

    const plainText = `Welcome ${userName}!\n\nYour StockMetaPro account has been created.\nPlan: ${planName}\nCredits: ${credits}\nLicense Key: ${apiKey}\n\nDownload App: ${downloadLink}`;

    const mailOptions = {
      from: `"StockMetaPro" <${user}>`,
      to: to,
      replyTo: "stockmetapro@gmail.com",
      subject: `🎉 Welcome ${userName}! Your StockMetaPro License Key Inside`,
      text: plainText,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': `SMP-${Date.now()}`,
      }
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
    const { user } = getCredentials();
    const downloadLink = await getLatestDownloadLink();
    const transporter = createTransporter();
    const formattedExpire = expireDate ? new Date(expireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    const htmlContent = buildEmailTemplate({
      title: `Subscription Renewed - StockMetaPro`,
      subtitle: `Account Subscription Renewal Confirmation`,
      mainBadge: `✓ SUBSCRIPTION RENEWED`,
      downloadUrl: downloadLink,
      contentHtml: `
        <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin:0 0 12px 0; text-align:center;">Hello ${userName}! 🎉</h2>
        <p style="color:#94a3b8; font-size:14px; line-height:1.6; margin:0 0 24px 0; text-align:center;">
          Your <strong>StockMetaPro</strong> account subscription has been successfully renewed.
        </p>

        <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:20px; margin-bottom:24px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">Renewed Plan:</td>
              <td style="padding:6px 0; color:#38bdf8; font-size:14px; font-weight:700; text-align:right;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">Credits Added:</td>
              <td style="padding:6px 0; color:#4ade80; font-size:14px; font-weight:700; text-align:right;">+${credits} Credits</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">New Expiry Date:</td>
              <td style="padding:6px 0; color:#f59e0b; font-size:14px; font-weight:700; text-align:right;">${formattedExpire}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:16px; border-top:1px solid #1e293b;">
                <div style="color:#94a3b8; font-size:12px; font-weight:600; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">YOUR LICENSE KEY</div>
                <div style="background:#1e293b; border:1px solid #22c55e; border-radius:8px; padding:12px; text-align:center; font-family:monospace; font-size:16px; font-weight:800; color:#4ade80; letter-spacing:1.5px;">
                  ${apiKey}
                </div>
              </td>
            </tr>
          </table>
        </div>
      `
    });

    const plainText = `Hello ${userName}!\n\nYour subscription has been renewed.\nPlan: ${planName}\nNew Expiry: ${formattedExpire}\nLicense Key: ${apiKey}\n\nDownload App: ${downloadLink}`;

    const mailOptions = {
      from: `"StockMetaPro" <${user}>`,
      to: to,
      replyTo: "stockmetapro@gmail.com",
      subject: `🎉 Account Successfully Renewed - StockMetaPro`,
      text: plainText,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': `SMP-RN-${Date.now()}`,
      }
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
    const { user } = getCredentials();
    const downloadLink = await getLatestDownloadLink();
    const transporter = createTransporter();

    const htmlContent = buildEmailTemplate({
      title: `Payment Verified & Activated - StockMetaPro`,
      subtitle: `Payment Manual Verification Complete`,
      mainBadge: `✓ PAYMENT VERIFIED & APPROVED`,
      downloadUrl: downloadLink,
      contentHtml: `
        <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin:0 0 12px 0; text-align:center;">Great news, ${userName}! ✅</h2>
        <p style="color:#94a3b8; font-size:14px; line-height:1.6; margin:0 0 24px 0; text-align:center;">
          Your payment has been manually verified by our team, and your <strong>StockMetaPro</strong> account is now fully activated!
        </p>

        <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:20px; margin-bottom:24px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">Activated Plan:</td>
              <td style="padding:6px 0; color:#38bdf8; font-size:14px; font-weight:700; text-align:right;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">Credits Included:</td>
              <td style="padding:6px 0; color:#4ade80; font-size:14px; font-weight:700; text-align:right;">${credits} Credits</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:16px; border-top:1px solid #1e293b;">
                <div style="color:#94a3b8; font-size:12px; font-weight:600; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">YOUR LICENSE KEY</div>
                <div style="background:#1e293b; border:1px solid #3b82f6; border-radius:8px; padding:12px; text-align:center; font-family:monospace; font-size:16px; font-weight:800; color:#60a5fa; letter-spacing:1.5px;">
                  ${apiKey}
                </div>
              </td>
            </tr>
          </table>
        </div>
      `
    });

    const plainText = `Hello ${userName}!\n\nYour payment has been verified and approved.\nPlan: ${planName}\nCredits: ${credits}\nLicense Key: ${apiKey}\n\nDownload App: ${downloadLink}`;

    const mailOptions = {
      from: `"StockMetaPro" <${user}>`,
      to: to,
      replyTo: "stockmetapro@gmail.com",
      subject: `✅ Payment Verified & Account Activated - StockMetaPro`,
      text: plainText,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': `SMP-AP-${Date.now()}`,
      }
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
    const { user } = getCredentials();
    const downloadLink = await getLatestDownloadLink();
    const transporter = createTransporter();
    const formattedExpire = expireDate ? new Date(expireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    const htmlContent = buildEmailTemplate({
      title: `Renewal Approved - StockMetaPro`,
      subtitle: `Manual Renewal Approval Confirmation`,
      mainBadge: `✓ RENEWAL APPROVED & ACTIVE`,
      downloadUrl: downloadLink,
      contentHtml: `
        <h2 style="color:#ffffff; font-size:20px; font-weight:700; margin:0 0 12px 0; text-align:center;">Hello ${userName}! 🎉</h2>
        <p style="color:#94a3b8; font-size:14px; line-height:1.6; margin:0 0 24px 0; text-align:center;">
          Your pending renewal payment has been verified and approved by admin. Your subscription is active!
        </p>

        <div style="background:#0f172a; border:1px solid #334155; border-radius:12px; padding:20px; margin-bottom:24px;">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">Renewed Plan:</td>
              <td style="padding:6px 0; color:#38bdf8; font-size:14px; font-weight:700; text-align:right;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">Credits Added:</td>
              <td style="padding:6px 0; color:#4ade80; font-size:14px; font-weight:700; text-align:right;">+${credits} Credits</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#64748b; font-size:13px;">New Expiry Date:</td>
              <td style="padding:6px 0; color:#f59e0b; font-size:14px; font-weight:700; text-align:right;">${formattedExpire}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:16px; border-top:1px solid #1e293b;">
                <div style="color:#94a3b8; font-size:12px; font-weight:600; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">YOUR LICENSE KEY</div>
                <div style="background:#1e293b; border:1px solid #22c55e; border-radius:8px; padding:12px; text-align:center; font-family:monospace; font-size:16px; font-weight:800; color:#4ade80; letter-spacing:1.5px;">
                  ${apiKey}
                </div>
              </td>
            </tr>
          </table>
        </div>
      `
    });

    const plainText = `Hello ${userName}!\n\nYour renewal payment has been approved.\nPlan: ${planName}\nNew Expiry: ${formattedExpire}\nLicense Key: ${apiKey}\n\nDownload App: ${downloadLink}`;

    const mailOptions = {
      from: `"StockMetaPro" <${user}>`,
      to: to,
      replyTo: "stockmetapro@gmail.com",
      subject: `✅ Renewal Payment Verified & Subscription Active - StockMetaPro`,
      text: plainText,
      html: htmlContent,
      headers: {
        'X-Entity-Ref-ID': `SMP-RNAP-${Date.now()}`,
      }
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Admin Approved Renew User email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('[EmailService] Error sending Pending Approved Renew email:', error.message);
    return false;
  }
}
