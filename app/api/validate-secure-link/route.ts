import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';
import { QRCode } from '@/models/QRCode';
import BrandSettings from '@/models/BrandSettings';

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

    // For starter users, don't block expired links - let the frontend handle it
    // Only block expired links for partner users
    if (secureLink.partnerId !== 'starter-user' && secureLink.expiresAt && new Date() > secureLink.expiresAt) {
      return NextResponse.json(
        { error: 'Link has expired' },
        { status: 410 }
      );
    }

    // Allow all links to be accessed multiple times
    // No longer marking links as used or blocking based on usage

    // No longer marking QR codes as used to allow multiple access

    // No longer notifying partners on every access to allow multiple usage

    // If it's a partner link (not starter-user), fetch brand settings
    let brandSettings = null;
    if (secureLink.partnerId !== 'starter-user') {
      try {
        brandSettings = await BrandSettings.findOne({ userId: secureLink.partnerId });
      } catch (error) {
        console.error('Error fetching brand settings:', error);
        // Don't fail the validation if brand settings fetch fails
      }
    }

    return NextResponse.json({
      success: true,
      chatId: secureLink.chatId,
      partnerId: secureLink.partnerId,
      expiresAt: secureLink.expiresAt,
      brandSettings: brandSettings ? {
        brandName: brandSettings.brandName,
        logoUrl: brandSettings.logoUrl,
        customColors: brandSettings.customColors
      } : null
    });

  } catch (error) {
    console.error('Error validating secure link:', error);
    return NextResponse.json(
      { error: 'Failed to validate secure link' },
      { status: 500 }
    );
  }
} 