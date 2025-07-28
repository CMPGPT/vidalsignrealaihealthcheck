import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OtpToken from '@/models/OtpToken';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
  const token = await OtpToken.findOne({ email, otp });
  if (!token) return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
  if (token.validateUntil < new Date()) {
    await OtpToken.deleteOne({ _id: token._id });
    return NextResponse.json({ error: 'OTP expired' }, { status: 410 });
  }
  await OtpToken.deleteOne({ _id: token._id });
  return NextResponse.json({ success: true });
} 