import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    await dbConnect();

    // Find user by verification token
    const user = await PartnerUser.findOne({ 
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid or expired verification token' 
      }, { status: 400 });
    }

    // Update user as verified and clear token
    await PartnerUser.findByIdAndUpdate(user._id, {
      verified: true,
      verificationToken: null,
      verificationTokenExpiry: null
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully! You can now log in to your account.' 
    });

  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
  }
} 