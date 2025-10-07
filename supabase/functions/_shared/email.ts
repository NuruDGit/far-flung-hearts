export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Love Beyond Borders <noreply@lobebo.com>',
      to,
      subject,
      html
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Resend API error:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

// Email Templates
export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: 'Welcome to Love Beyond Borders! 💕',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B9D 0%, #C651A5 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #FF6B9D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .feature { margin: 15px 0; padding-left: 25px; position: relative; }
            .feature:before { content: "💕"; position: absolute; left: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">Welcome to Love Beyond Borders!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>We're thrilled to have you join our community of couples keeping their love strong across any distance! 💕</p>
              
              <h2 style="color: #FF6B9D; margin-top: 30px;">Get Started:</h2>
              <div class="feature">Set up your profile and connect with your partner</div>
              <div class="feature">Try our AI Love Advisor - Proxima</div>
              <div class="feature">Create shared goals and track them together</div>
              <div class="feature">Log your moods and support each other</div>
              <div class="feature">Schedule video calls and stay connected</div>
              
              <p style="margin-top: 30px;">Your love journey starts now. We're here to help every step of the way!</p>
              
              <a href="https://lobebo.com/app" class="button">Open Love Beyond Borders</a>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Need help? Reply to this email or visit our <a href="https://lobebo.com/help" style="color: #FF6B9D;">Help Center</a>.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Made with ❤️ by Love Beyond Borders</p>
              <p style="margin: 10px 0 0 0;">
                <a href="https://lobebo.com" style="color: #FF6B9D; text-decoration: none;">Website</a> • 
                <a href="https://lobebo.com/privacy" style="color: #FF6B9D; text-decoration: none;">Privacy</a> • 
                <a href="https://lobebo.com/terms" style="color: #FF6B9D; text-decoration: none;">Terms</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  passwordReset: (resetLink: string, userName: string) => ({
    subject: 'Reset Your Password - Love Beyond Borders',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B9D 0%, #C651A5 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #FF6B9D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>We received a request to reset your password for your Love Beyond Borders account.</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>
              
              <div class="alert">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">This link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Or copy and paste this URL into your browser:<br>
                <code style="background: #f3f4f6; padding: 8px; display: block; margin-top: 10px; border-radius: 4px; word-break: break-all;">${resetLink}</code>
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">If you need help, contact us at support@lobebo.com</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  subscriptionConfirmation: (plan: string, userName: string) => ({
    subject: `Welcome to ${plan} - Love Beyond Borders`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B9D 0%, #C651A5 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 12px 12px; }
            .badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; margin: 10px 0; }
            .feature-list { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { padding: 8px 0; }
            .feature-item:before { content: "✓"; color: #10b981; font-weight: bold; margin-right: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 32px;">🎉 Subscription Activated!</h1>
              <div class="badge">${plan.toUpperCase()}</div>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Thank you for upgrading to <strong>${plan}</strong>! Your subscription is now active.</p>
              
              <div class="feature-list">
                <h3 style="margin-top: 0; color: #FF6B9D;">Your Premium Benefits:</h3>
                <div class="feature-item">Unlimited AI Love Advisor conversations</div>
                <div class="feature-item">Advanced mood analytics & insights</div>
                <div class="feature-item">Unlimited video call duration</div>
                <div class="feature-item">Priority customer support</div>
                <div class="feature-item">Exclusive relationship resources</div>
                <div class="feature-item">Ad-free experience</div>
              </div>
              
              <p>Start exploring your new features today and make your relationship even stronger!</p>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Manage your subscription anytime in your <a href="https://lobebo.com/app/subscription" style="color: #FF6B9D;">account settings</a>.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Thank you for supporting Love Beyond Borders! 💕</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  paymentFailed: (userName: string, amount: string, retryUrl: string) => ({
    subject: 'Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">⚠️ Payment Failed</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>We were unable to process your payment of <strong>${amount}</strong> for your Love Beyond Borders subscription.</p>
              
              <div class="alert">
                <strong>What happens now?</strong>
                <p style="margin: 10px 0 0 0;">Your premium features will remain active for the next 7 days. Please update your payment method to avoid service interruption.</p>
              </div>
              
              <p><strong>Common reasons for payment failure:</strong></p>
              <ul style="color: #6b7280;">
                <li>Insufficient funds</li>
                <li>Expired card</li>
                <li>Card security check required</li>
                <li>Incorrect billing information</li>
              </ul>
              
              <a href="${retryUrl}" class="button">Update Payment Method</a>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Need help? Contact us at support@lobebo.com
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Love Beyond Borders</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  exportDataReady: (userName: string, downloadUrl: string, expiresIn: string) => ({
    subject: 'Your Data Export is Ready - Love Beyond Borders',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">📦 Your Data Export is Ready</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Your requested data export from Love Beyond Borders is now ready for download.</p>
              
              <div class="info-box">
                <strong>📋 What's included:</strong>
                <ul style="margin: 10px 0 0 0;">
                  <li>Profile information</li>
                  <li>Messages and conversations</li>
                  <li>Mood logs and analytics</li>
                  <li>Shared goals and tasks</li>
                  <li>Calendar events</li>
                  <li>Media files</li>
                </ul>
              </div>
              
              <a href="${downloadUrl}" class="button">Download Your Data</a>
              
              <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
                <strong>⏰ Important:</strong> This download link will expire in <strong>${expiresIn}</strong>. Please download your data before then.
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                The download will be a ZIP file containing all your data in JSON format. If you have any questions, contact us at support@lobebo.com
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Love Beyond Borders - Your data, your privacy</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  securityAlert: (userName: string, alertType: string, alertDetails: string, actionRequired: string) => ({
    subject: `Security Alert - ${alertType}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .alert { background: #fef2f2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .detail-box { background: #f9fafb; padding: 15px; border-radius: 4px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🔐 Security Alert</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              
              <div class="alert">
                <h2 style="margin-top: 0; color: #dc2626;">${alertType}</h2>
                <p style="margin-bottom: 0;"><strong>We detected unusual activity on your account that requires your attention.</strong></p>
              </div>
              
              <div class="detail-box">
                <strong>Alert Details:</strong>
                <p style="margin: 10px 0 0 0;">${alertDetails}</p>
              </div>
              
              <h3 style="color: #dc2626;">Action Required:</h3>
              <p>${actionRequired}</p>
              
              <a href="https://lobebo.com/security" class="button">Review Security Settings</a>
              
              <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>💡 Security Tips:</strong>
                <ul style="margin: 10px 0 0 0; color: #92400e;">
                  <li>Never share your password with anyone</li>
                  <li>Enable two-factor authentication</li>
                  <li>Use a unique, strong password</li>
                  <li>Review your account activity regularly</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If you didn't perform this action or believe your account has been compromised, please contact our security team immediately at security@lobebo.com
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">Love Beyond Borders Security Team</p>
              <p style="margin: 10px 0 0 0; font-size: 12px;">This is an automated security alert. Do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
};
