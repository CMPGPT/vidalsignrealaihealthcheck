import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createCanvas, loadImage, registerFont } from 'canvas';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secureLinkId, partnerId } = body;

    if (!secureLinkId || !partnerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Get partner and brand information
    const partnerUser = await PartnerUser.findById(partnerId);
    const brandSettings = await BrandSettings.findOne({ userId: partnerId });

    if (!partnerUser || !brandSettings) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Create the secure link URL
    const secureUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/secure/chat/${secureLinkId}`;

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secureUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create branded QR code with partner information
    const brandedQRCode = await createBrandedQRCode(
      qrCodeDataUrl,
      brandSettings.brandName,
      partnerUser.first_Name,
      partnerUser.last_Name,
      brandSettings.customColors?.primary || '#667eea',
      brandSettings.customColors?.secondary || '#764ba2'
    );

    return NextResponse.json({
      success: true,
      qrCodeDataUrl: brandedQRCode,
      secureUrl
    });

  } catch (error) {
    console.error('Error generating branded QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}

async function createBrandedQRCode(
  qrCodeDataUrl: string,
  brandName: string,
  firstName: string,
  lastName: string,
  primaryColor: string,
  secondaryColor: string
): Promise<string> {
  // Create canvas
  const canvas = createCanvas(400, 500);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, primaryColor);
  gradient.addColorStop(1, secondaryColor);

  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load QR code image
  const qrImage = await loadImage(qrCodeDataUrl);

  // Calculate QR code position (centered)
  const qrSize = 250;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = 80;

  // Draw white background for QR code
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

  // Draw QR code
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // Add brand name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(brandName, canvas.width / 2, 40);

  // Add "Scan to Access" text
  ctx.font = '14px Arial';
  ctx.fillText('Scan to Access Secure Link', canvas.width / 2, 390);

  // Add border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

  // Convert to data URL
  return canvas.toDataURL('image/png');
} 