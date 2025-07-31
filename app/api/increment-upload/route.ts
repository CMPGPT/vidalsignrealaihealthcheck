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

    // Find and update the public link
    const publicLink = await PublicLink.findOneAndUpdate(
      { chatId },
      { $inc: { fileUploadCount: 1 } },
      { new: true }
    );

    if (!publicLink) {
      console.log('PublicLink not found for chatId:', chatId);
      // Return success even if link not found to avoid blocking upload
      return NextResponse.json({
        success: true,
        fileUploadCount: 0,
        message: 'Link not found but continuing with upload'
      });
    }

    return NextResponse.json({
      success: true,
      fileUploadCount: publicLink.fileUploadCount
    });

  } catch (error) {
    console.error('Increment upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update upload count' },
      { status: 500 }
    );
  }
} 