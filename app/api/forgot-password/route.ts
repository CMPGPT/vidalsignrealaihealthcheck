import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import OtpToken from '@/models/OtpToken';
import { sendOtpEmail } from '@/lib/sendEmail';
import { doubleEncrypt } from '@/lib/encryption';

function generateOTP(length = 8) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    await dbConnect();

    const encryptedEmail = doubleEncrypt(email);

    const user = await PartnerUser.findOne({ email: encryptedEmail });

    if (!user) {
      return NextResponse.json({ message: 'No account found with this email.' }, { status: 404 });
    }

    const otp = generateOTP();
    const createdAt = new Date();
    const validateUntil = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes validity

    await sendOtpEmail(email, otp);

    await OtpToken.create({
      userId: user._id,
      email: encryptedEmail,
      otp,
      createdAt,
      validateUntil,
    });

    return NextResponse.json({ message: 'OTP sent successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Failed to process forgot password.' }, { status: 500 });
  }
}
