import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AdminUser from '@/models/AdminUser';
import OtpToken from '@/models/OtpToken';
import nodemailer from 'nodemailer';

function generateOtp(length = 8) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  const admin = await AdminUser.findOne({ email });
  if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
  const otp = generateOtp();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  await OtpToken.deleteMany({ email }); // Remove old OTPs
  await OtpToken.create({ email, otp, validateUntil: expiry });
  // Send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: `VidalSigns <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your Admin OTP',
    html: `
      <div style="max-width:480px;margin:40px auto;padding:32px 24px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);font-family:sans-serif;">
        <div style="text-align:center;margin-bottom:24px;">
          <img src="https://x4pmsuyhf1.ufs.sh/f/AEzLpXBbAEQa7SHo6N5IO68wiogc54sXfCVIET9uJd2RWSZN" alt="VidalSigns Logo" style="height:64px;margin-bottom:8px;" />
          <h1 style="font-size:1.5rem;color:#222;margin:0;font-weight:700;">VidalSigns Admin OTP</h1>
        </div>
        <div style="background:#f5f8ff;padding:24px 0;border-radius:12px;text-align:center;margin-bottom:24px;">
          <span style="font-size:1.1rem;color:#222;font-weight:500;">Your OTP code is</span>
          <div style="font-size:2.2rem;font-weight:700;letter-spacing:0.2em;color:#2563eb;background:#fff;padding:12px 0;margin:16px 0 0 0;border-radius:8px;display:inline-block;min-width:220px;">
            ${otp}
          </div>
        </div>
        <p style="color:#333;font-size:1rem;text-align:center;margin:0 0 16px 0;">This code is valid for <b>5 minutes</b>. Please do not share it with anyone.</p>
        <div style="text-align:center;color:#888;font-size:0.95rem;margin-top:24px;">If you did not request this code, you can safely ignore this email.</div>
      </div>
    `
  });
  return NextResponse.json({ success: true });
} 