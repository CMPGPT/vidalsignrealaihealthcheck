import nodemailer from 'nodemailer';

export async function sendOtpEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // আপনার Gmail
      pass: process.env.GMAIL_APP_PASSWORD, // অ্যাপ পাসওয়ার্ড
    },
  });

  const mailOptions = {
    from: `"VidalSigns Support" <${process.env.GMAIL_USER}>`,
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
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Create HTML content for secure links
  const secureLinksHtml = secureLinks.map((link, index) => `
    <div style="margin: 10px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
      <h3 style="margin: 0 0 10px 0; color: #333;">Secure Link ${index + 1}</h3>
      <p style="margin: 5px 0; color: #666;">Link: <a href="${link}" style="color: #007bff; text-decoration: none;">${link}</a></p>
      <p style="margin: 5px 0; color: #666; font-size: 12px;">Expires in 24 hours</p>
    </div>
  `).join('');

  // Create HTML content for QR codes
  const qrCodesHtml = qrCodes.map((qrCode, index) => `
    <div style="margin: 10px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
      <h3 style="margin: 0 0 10px 0; color: #333;">QR Code ${index + 1}</h3>
      <p style="margin: 5px 0; color: #666;">QR Code ID: ${qrCode}</p>
      <p style="margin: 5px 0; color: #666; font-size: 12px;">Single use</p>
    </div>
  `).join('');

  const mailOptions = {
    from: `"${brandName} via VidalSigns" <${process.env.GMAIL_USER}>`,
    to: customerEmail,
    replyTo: partnerEmail, // Customers can reply to the partner's email
    subject: `Your ${plan} Purchase from ${brandName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">Thank You for Your Purchase!</h1>
          <p style="color: #666; margin: 0;">Your order has been processed successfully.</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p><strong>Plan:</strong> ${plan}</p>
          <p><strong>Quantity:</strong> ${quantity}</p>
          <p><strong>From:</strong> ${brandName}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333;">Your Secure Links</h2>
          <p style="color: #666; margin-bottom: 20px;">Use these secure links to share lab reports with your patients:</p>
          ${secureLinksHtml}
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #333;">Your QR Codes</h2>
          <p style="color: #666; margin-bottom: 20px;">Use these QR codes for easy access:</p>
          ${qrCodesHtml}
        </div>
        
        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin-top: 0;">Important Information</h3>
          <ul style="color: #666; margin: 0; padding-left: 20px;">
            <li>Secure links expire in 24 hours</li>
            <li>QR codes are single-use only</li>
            <li>Keep these links and codes secure</li>
            <li>Contact ${partnerName} if you need assistance</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; margin: 0; font-size: 14px;">
            This email was sent from ${brandName} via VidalSigns<br>
            For support, reply to this email or contact ${partnerName}
          </p>
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
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const isLinkUsage = plan === 'Secure Link Used';
  const subject = isLinkUsage 
    ? `Secure Link Used on ${brandName}` 
    : `New Purchase on ${brandName} - ${plan}`;

  const mailOptions = {
    from: `"VidalSigns" <${process.env.GMAIL_USER}>`,
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
