import nodemailer from 'nodemailer';

// No QR code testing needed
console.log('✅ Email template ready for secure links');

export default async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"VidalSigns" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // অ্যাপ পাসওয়ার্ড
    },
  });

  const mailOptions = {
    from: `"VidalSigns Support" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Your OTP for Password Reset',
    html: `
      <p>Hello,</p>
      <p>Your OTP code for password reset is:</p>
      <h2>${otp}</h2>
      <p>This code is valid for 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendSecureLinksEmail(
  customerEmail: string,
  partnerEmail: string,
  partnerName: string,
  brandName: string,
  secureLinks: string[],
  qrCodes: string[],
  plan: string,
  quantity: number
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Use simple hardcoded email for contact
  const decryptedPartnerEmail = 'textgpt.team@gmail.com';
  console.log('✅ EMAIL: Using hardcoded contact email:', decryptedPartnerEmail);

  // No QR code generation needed
  console.log('🔍 Preparing secure links for email:', secureLinks.length, 'links');

  // Create beautiful table for secure links with buttons
  console.log('🔍 Creating email table HTML...');
  const secureLinksTableHtml = secureLinks.map((link, index) => {
    console.log(`📋 Link ${index + 1}: ${link.substring(0, 50)}...`);
    
    return `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 20px; text-align: center; vertical-align: middle; width: 150px;">
          <div style="background: #667eea; color: white; padding: 15px; border-radius: 10px; display: inline-block;">
            <div style="font-size: 24px; margin-bottom: 8px;">🔗</div>
            <div style="font-size: 14px; font-weight: 600;">Link ${index + 1}</div>
          </div>
        </td>
        <td style="padding: 20px; vertical-align: middle;">
          <div style="margin-bottom: 12px;">
            <strong style="color: #333; font-size: 18px;">Secure Link ${index + 1}</strong>
          </div>
          <div style="margin-bottom: 12px;">
            <a href="${link}" style="color: #007bff; text-decoration: none; word-break: break-all; font-size: 14px;">${link}</a>
          </div>
          <div style="margin-bottom: 15px;">
            <a href="${link}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              🔗 Open Secure Link
            </a>
          </div>
          <div style="font-size: 12px; color: #666;">
            <span style="background: #e8f5e8; color: #28a745; padding: 4px 10px; border-radius: 12px; font-size: 11px; margin-right: 8px;">⏰ 24h Expiry</span>
            <span style="background: #fff3cd; color: #856404; padding: 4px 10px; border-radius: 12px; font-size: 11px;">🔒 Single Use</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  console.log('✅ Email table HTML created successfully');

  const mailOptions = {
    from: `"${brandName} via VidalSigns" <${process.env.SMTP_FROM}>`,
    to: customerEmail,
    replyTo: decryptedPartnerEmail,
    subject: `Your ${plan} Purchase from ${brandName}`,
    html: `
      <div style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background: #667eea; padding: 20px;">
        <!-- Header -->
        <div style="background: white; border-radius: 16px; padding: 30px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #667eea; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎉 Thank You!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your purchase from ${brandName} has been processed successfully</p>
            </div>
          </div>
          
          <!-- Order Summary -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #667eea;">
            <h2 style="color: #333; margin-top: 0; font-size: 20px; display: flex; align-items: center;">
              <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-right: 12px;">📋</span>
              Order Summary
            </h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
              <div>
                <strong style="color: #555;">Plan:</strong><br>
                <span style="color: #333; font-size: 16px;">${plan}</span>
              </div>
              <div>
                <strong style="color: #555;">Quantity:</strong><br>
                <span style="color: #333; font-size: 16px;">${quantity} Secure Links</span>
              </div>
              <div>
                <strong style="color: #555;">Provider:</strong><br>
                <span style="color: #333; font-size: 16px;">${brandName}</span>
              </div>
              <div>
                <strong style="color: #555;">Contact:</strong><br>
                <span style="color: #333; font-size: 16px;">${decryptedPartnerEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Secure Links Table -->
        <div style="background: white; border-radius: 16px; padding: 30px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0; font-size: 22px; display: flex; align-items: center; margin-bottom: 25px;">
            <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-right: 12px;">🔗</span>
            Your Secure Links
          </h2>
          
          <div style="background: #f8f9fa; border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #667eea; color: white;">
                  <th style="padding: 15px; text-align: center; font-weight: 600; width: 150px;">Link</th>
                  <th style="padding: 15px; text-align: left; font-weight: 600;">Secure Link Details</th>
                </tr>
              </thead>
              <tbody>
                ${secureLinksTableHtml}
              </tbody>
            </table>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0; font-size: 16px;">📱 How to Use</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px; font-size: 14px;">
              <li><strong>Click Button:</strong> Use the "Open Secure Link" button for instant access</li>
              <li><strong>Copy Link:</strong> Or copy the secure link URL directly</li>
              <li><strong>Share Safely:</strong> Share these links with your patients for lab report access</li>
              <li><strong>24-Hour Access:</strong> Each link is valid for 24 hours from opening the link</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: white; border-radius: 16px; padding: 30px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 10px; font-size: 18px;">${brandName}</h3>
            <p style="color: #666; margin: 0; font-size: 14px;">AI-powered health analysis for everyone</p>
          </div>
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
            <p style="color: #666; margin: 0; font-size: 12px;">
              This email was sent from ${brandName} via VidalSigns<br>
              For support, reply to this email or contact ${decryptedPartnerEmail}
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', customerEmail);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

export async function sendPartnerNotificationEmail(
  partnerEmail: string,
  partnerName: string,
  brandName: string,
  customerEmail: string,
  plan: string,
  quantity: number,
  amount: number
) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const isLinkUsage = plan === 'Secure Link Used';
  const subject = isLinkUsage 
    ? `Secure Link Used on ${brandName}` 
    : `New Purchase on ${brandName} - ${plan}`;

  const mailOptions = {
    from: `"VidalSigns" <${process.env.SMTP_FROM}>`,
    to: partnerEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">${isLinkUsage ? 'Secure Link Used!' : 'New Purchase Alert!'}</h1>
          <p style="color: #666; margin: 0;">${isLinkUsage ? 'Someone just used your secure link.' : 'Someone just purchased from your website.'}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">${isLinkUsage ? 'Link Usage Details' : 'Purchase Details'}</h2>
          ${isLinkUsage ? `
            <p><strong>Link Type:</strong> Secure Link</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Brand:</strong> ${brandName}</p>
            <p><strong>Usage Date:</strong> ${new Date().toLocaleString()}</p>
          ` : `
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Brand:</strong> ${brandName}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          `}
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin-top: 0;">${isLinkUsage ? 'What This Means' : 'What Happens Next'}</h3>
          <ul style="color: #666; margin: 0; padding-left: 20px;">
            ${isLinkUsage ? `
              <li>Your secure link has been accessed by a customer</li>
              <li>The customer can now upload and analyze their lab reports</li>
              <li>You can track this usage in your partner dashboard</li>
              <li>This helps you understand how your links are being used</li>
            ` : `
              <li>Secure links and QR codes have been generated</li>
              <li>Customer has been emailed with their purchase details</li>
              <li>Your revenue has been updated in your dashboard</li>
              <li>You can track usage in your partner dashboard</li>
            `}
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            This is an automated notification from VidalSigns
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Partner notification email sent successfully to:', partnerEmail);
  } catch (error) {
    console.error('❌ Error sending partner notification email:', error);
    throw error;
  }
}

// Send password change OTP email
export const sendPasswordOTPEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"VidalSigns" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Password Change Verification - VidalSigns',
    html: `
      <div style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #667eea; padding: 20px;">
        <div style="background: white; border-radius: 16px; padding: 30px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #667eea; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🔐 Password Change Request</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Verify your identity to change your password</p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #667eea;">
            <h2 style="color: #333; margin-top: 0; font-size: 20px; display: flex; align-items: center;">
              <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-right: 12px;">📧</span>
              Verification Code
            </h2>
            <div style="text-align: center; margin: 20px 0;">
              <div style="background: #667eea; color: white; padding: 20px; border-radius: 12px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
                ${otp}
              </div>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center; margin: 0;">
              Enter this 4-digit code to verify your password change request
            </p>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0; font-size: 16px;">⚠️ Important Information</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>This code will expire in 10 minutes</li>
              <li>If you didn't request this password change, please ignore this email</li>
              <li>Never share this code with anyone</li>
              <li>For security, this code can only be used once</li>
            </ul>
          </div>
        </div>
        
        <div style="background: white; border-radius: 16px; padding: 30px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 10px; font-size: 18px;">VidalSigns</h3>
            <p style="color: #666; margin: 0; font-size: 14px;">AI-powered health analysis for everyone</p>
          </div>
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
            <p style="color: #666; margin: 0; font-size: 12px;">
              This email was sent for password change verification<br>
              If you have any questions, contact support at textgpt.team@gmail.com
            </p>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Send account verification email
export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"VidalSigns" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Verify Your VidalSigns Account',
    html: `
      <div style="font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #667eea; padding: 20px;">
        <div style="background: white; border-radius: 16px; padding: 30px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: #667eea; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🔐 Verify Your Account</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Welcome to VidalSigns! Please verify your email address</p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #667eea;">
            <h2 style="color: #333; margin-top: 0; font-size: 20px; display: flex; align-items: center;">
              <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-right: 12px;">📧</span>
              Email Verification Required
            </h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for creating your VidalSigns account! To complete your registration and access all features, please verify your email address by clicking the button below.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px;">
              ✅ Verify Email Address
            </a>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0; font-size: 16px;">⚠️ Important Information</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>This verification link will expire in 24 hours</li>
              <li>If you didn't create this account, please ignore this email</li>
              <li>You won't be able to access your account until verified</li>
              <li>For security, this link can only be used once</li>
            </ul>
          </div>
        </div>
        
        <div style="background: white; border-radius: 16px; padding: 30px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 10px; font-size: 18px;">VidalSigns</h3>
            <p style="color: #666; margin: 0; font-size: 14px;">AI-powered health analysis for everyone</p>
          </div>
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
            <p style="color: #666; margin: 0; font-size: 12px;">
              This email was sent for account verification<br>
              If you have any questions, contact support at textgpt.team@gmail.com
            </p>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
