import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import bcrypt from 'bcryptjs';
import { doubleDecrypt, doubleEncrypt } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, otp } = body;

    if (!currentPassword || !newPassword || !otp) {
      return NextResponse.json({ error: 'Current password, new password, and OTP are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    await dbConnect();

    // Find the user by email (token.email is already the plain email from session)
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      // If not found by plain email, try to find by encrypted email
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.error('Error with encrypted email lookup:', error);
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify OTP
    if (!user.passwordChangeOTP || user.passwordChangeOTP !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // Check if OTP is expired
    if (user.passwordChangeOTPExpiry && new Date() > user.passwordChangeOTPExpiry) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and clear OTP
    await PartnerUser.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
      passwordChangeOTP: null,
      passwordChangeOTPExpiry: null
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
} 