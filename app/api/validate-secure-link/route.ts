import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { linkId } = await request.json();

    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Find the secure link
    const secureLink = await SecureLink.findOne({ linkId });

    if (!secureLink) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Check if link has expired
    if (new Date() > secureLink.expiresAt) {
      return NextResponse.json(
        { error: 'Link has expired' },
        { status: 410 }
      );
    }

    // Check if link has already been used
    if (secureLink.isUsed) {
      return NextResponse.json(
        { error: 'Link has already been used' },
        { status: 410 }
      );
    }

    // Mark the link as used
    secureLink.isUsed = true;
    secureLink.usedAt = new Date();
    await secureLink.save();

    return NextResponse.json({
      success: true,
      chatId: secureLink.chatId,
      partnerId: secureLink.partnerId,
    });

  } catch (error) {
    console.error('Error validating secure link:', error);
    return NextResponse.json(
      { error: 'Failed to validate secure link' },
      { status: 500 }
    );
  }
} 