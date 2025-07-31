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

    return NextResponse.json({
      success: true,
      fileUploadCount: publicLink.fileUploadCount,
      maxUploads: 2, // Set maximum uploads to 2
      canUpload: publicLink.fileUploadCount < 2
    });

  } catch (error) {
    console.error('Check upload count error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check upload count' },
      { status: 500 }
    );
  }
} 