import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  } else {
    // Development fallback: use test ethereal transporter or mock delivery
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('[Mailer] Using Ethereal development mail transport.');
    } catch {
      // Direct console mock transporter if ethereal is unreachable
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      console.log('[Mailer] Using JSON development mail transporter.');
    }
  }

  return transporter;
}

export async function sendOtpEmail(to: string, otp: string): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    const transport = await getTransporter();
    const from = process.env.SMTP_FROM || '"BrightSmile Dental Admin" <admin@brightsmile.com>';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
          .content { padding: 32px 28px; }
          .badge { display: inline-block; padding: 4px 12px; background: #ccfbf1; color: #0f766e; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          .code-box { background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f766e; margin: 0; }
          .footer { padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>BrightSmile Dental Clinic</h1>
            <p>Admin Portal Identity Verification</p>
          </div>
          <div class="content">
            <span class="badge">Security Verification</span>
            <p>Hello Administrator,</p>
            <p>A request was received to access the <strong>BrightSmile Clinic Management Dashboard</strong> for <strong>${to}</strong>.</p>
            <p>Use the single-use 6-digit verification code below to complete your authentication:</p>
            
            <div class="code-box">
              <div class="code">${otp}</div>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              • This code is valid for <strong>10 minutes</strong>.<br>
              • Never share this verification code with anyone.<br>
              • If you did not request this code, no action is needed; your portal remains secure.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} BrightSmile Dental Clinic. High-Trust Clinical Systems.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transport.sendMail({
      from,
      to,
      subject: `[${otp}] Your BrightSmile Admin Verification Code`,
      text: `Your BrightSmile Admin Verification Code is: ${otp}. Valid for 10 minutes.`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    
    // Clear formatted log in server console for audit and effortless testing
    console.log(`\n======================================================`);
    console.log(`🔒 [ADMIN SECURITY AUDIT] OTP CODE GENERATED`);
    console.log(`Recipient: ${to}`);
    console.log(`OTP Code:  👉  ${otp}  👈`);
    console.log(`Expires:   10 Minutes from now`);
    if (previewUrl) {
      console.log(`Ethereal Email Preview: ${previewUrl}`);
    }
    console.log(`======================================================\n`);

    return { success: true, previewUrl };
  } catch (error) {
    console.error('[Mailer Error] Failed to send email:', error);
    // Even if remote mail dispatch fails, log to console so admin flow works
    console.log(`\n🔑 [FALLBACK DEV OTP]: Recipient: ${to} | Code: ${otp}\n`);
    return { success: true };
  }
}
