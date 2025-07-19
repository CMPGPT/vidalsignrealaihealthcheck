import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';
import { QRCode } from '@/models/QRCode';

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

    // Also mark the associated QR code as used if it exists
    if (secureLink.metadata?.qrCodeId) {
      try {
        await QRCode.findOneAndUpdate(
          { id: secureLink.metadata.qrCodeId },
          { 
            used: true,
            usedDate: new Date(),
            usedBy: 'secure_link_usage'
          }
        );
        console.log('✅ LINK VALIDATION: QR code marked as used:', secureLink.metadata.qrCodeId);
      } catch (qrError) {
        console.error('❌ LINK VALIDATION: Failed to mark QR code as used:', qrError);
        // Don't fail the validation if QR code update fails
      }
    }

    // Notify the partner that their link was used
    try {
      const customerEmail = secureLink.metadata?.customerEmail || 'Unknown Customer';
      
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notify-partner-link-used`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId: secureLink.linkId,
          partnerId: secureLink.partnerId,
          customerEmail: customerEmail,
          chatId: secureLink.chatId,
        }),
      });
    } catch (notificationError) {
      console.error('❌ LINK VALIDATION: Failed to notify partner:', notificationError);
      // Don't fail the validation if notification fails
    }

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