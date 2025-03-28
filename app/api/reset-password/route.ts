import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OtpToken from '@/models/OtpToken';
import PartnerUser from '@/models/PartnerUser';
import { doubleEncrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
      const { email, code, password } = await req.json();
  
      if (!email || !code || !password) {
        return NextResponse.json({ message: 'Email, code and password are required.' }, { status: 400 });
      }
  
      await dbConnect();
  
      const encryptedEmail = doubleEncrypt(email);
  
      const otpEntry = await OtpToken.findOne({ email: encryptedEmail, otp: code }).sort({ createdAt: -1 });
      if (!otpEntry) {
        return NextResponse.json({ message: 'Invalid or expired verification code.' }, { status: 400 });
      }
  
      const now = new Date();
      if (now > otpEntry.validateUntil) {
        return NextResponse.json({ message: 'Verification code has expired.' }, { status: 400 });
      }
  
      const user = await PartnerUser.findOne({ email: encryptedEmail });
      if (!user) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
      }

      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        return NextResponse.json({
          message: 'You have used this password before. Please choose a new password.',
        }, { status: 400 });
      }
  
      // 🔐 Hash and update
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
  
      await OtpToken.deleteMany({ email: encryptedEmail });
  
      return NextResponse.json({ message: 'Password reset successfully.' }, { status: 200 });
  
    } catch (error) {
      console.error('Reset password error:', error);
      return NextResponse.json({ message: 'Failed to reset password.' }, { status: 500 });
    }
  }
