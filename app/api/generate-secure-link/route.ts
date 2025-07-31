import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { partnerId, chatId, expiryHours = 24 } = await request.json();

    if (!partnerId || !chatId) {
      return NextResponse.json(
        { error: 'Partner ID and Chat ID are required' },
        { status: 400 }
      );
    }

    // Generate a unique link ID
    const linkId = uuidv4();
    // Set expiresAt to null (no expiration)
    const expiresAt = null;

    // Create the secure link
    const secureLink = new SecureLink({
      linkId,
      partnerId,
      chatId,
      expiresAt,
    });
    await secureLink.save();

    // Generate the secure URL
    const secureUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/secure/chat/${linkId}`;

    return NextResponse.json({
      success: true,
      linkId,
      secureUrl,
      expiresAt,
      partnerId,
      chatId,
    });

  } catch (error) {
    console.error('Error generating secure link:', error);
    return NextResponse.json(
      { error: 'Failed to generate secure link' },
      { status: 500 }
    );
  }
} 