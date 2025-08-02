import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { doubleDecrypt } from '@/lib/encryption';
import { sendPasswordOTPEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find the user by encrypted email
    const user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Decrypt the email
    let decryptedEmail = '';
    try {
      decryptedEmail = doubleDecrypt(user.email);
    } catch (error) {
      console.error('Error decrypting email:', error);
      return NextResponse.json({ error: 'Failed to decrypt email' }, { status: 500 });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP in session storage (in production, use Redis or database)
    // For now, we'll store it temporarily in the user document
    await PartnerUser.findByIdAndUpdate(user._id, {
      passwordChangeOTP: otp,
      passwordChangeOTPExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP email
    try {
      await sendPasswordOTPEmail(decryptedEmail, otp);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent to your email' 
    });

  } catch (error) {
    console.error('Error sending password OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
} 