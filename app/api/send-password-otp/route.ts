import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { doubleDecrypt, doubleEncrypt } from '@/lib/encryption';
import { sendPasswordOTPEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Use the email from token (which is already decrypted)
    const decryptedEmail = token.email;

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