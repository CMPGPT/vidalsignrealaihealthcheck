import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OtpToken from '@/models/OtpToken';
import { doubleEncrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ message: 'Email and code are required.' }, { status: 400 });
    }

    await dbConnect();

    const encryptedEmail = doubleEncrypt(email);

    // Find the latest OTP token
    const otpEntry = await OtpToken.findOne({ email: encryptedEmail, otp: code }).sort({ createdAt: -1 });

    if (!otpEntry) {
      return NextResponse.json({ message: 'Invalid code or email.' }, { status: 400 });
    }

    const now = new Date();
    if (now > otpEntry.validateUntil) {
      return NextResponse.json({ message: 'Verification code has expired.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'OTP verified successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ message: 'Failed to verify code.' }, { status: 500 });
  }
}
