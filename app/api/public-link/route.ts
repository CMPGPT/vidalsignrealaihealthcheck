import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PublicLink from '@/models/PublicLink';

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the public link
    const publicLink = await PublicLink.findOne({ chatId });

    if (!publicLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Check if link is still valid
    const now = new Date();
    const isValid = publicLink.isOpen && publicLink.validTo > now;

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Link has expired or is closed' },
        { status: 410 }
      );
    }

    // Mark as used if not already used
    if (!publicLink.isUsed) {
      publicLink.isUsed = true;
      await publicLink.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        chatId: publicLink.chatId,
        email: publicLink.email,
        isOpen: publicLink.isOpen,
        fileUploadCount: publicLink.fileUploadCount,
        validFrom: publicLink.validFrom,
        validTo: publicLink.validTo,
        isUsed: publicLink.isUsed,
        createdAt: publicLink.createdAt
      }
    });

  } catch (error) {
    console.error('Public link validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate link' },
      { status: 500 }
    );
  }
} 