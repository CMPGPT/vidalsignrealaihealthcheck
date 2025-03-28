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
