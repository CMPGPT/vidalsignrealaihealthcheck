import { NextRequest, NextResponse } from 'next/server';
import { SecureLink } from '@/models/SecureLink';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const paymentDate = searchParams.get('paymentDate');

    if (!partnerId || !paymentDate) {
      return NextResponse.json(
        { success: false, error: 'Partner ID and payment date are required' },
        { status: 400 }
      );
    }

    // Parse the payment date to get the date range
    const paymentDateTime = new Date(paymentDate);
    const startOfDay = new Date(paymentDateTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(paymentDateTime);
    endOfDay.setHours(23, 59, 59, 999);

    // Find secure links for the partner within the payment date range
    const links = await SecureLink.find({
      partnerId: partnerId,
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).select('linkId isUsed createdAt').sort({ createdAt: -1 });

    // Format the response
    const formattedLinks = links.map(link => ({
      linkId: link.linkId,
      isUsed: link.isUsed || false,
      createdAt: link.createdAt
    }));

    return NextResponse.json({
      success: true,
      links: formattedLinks,
      total: formattedLinks.length,
      used: formattedLinks.filter(link => link.isUsed).length,
      unused: formattedLinks.filter(link => !link.isUsed).length
    });

  } catch (error) {
    console.error('Payment secure links API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load secure links' },
      { status: 500 }
    );
  }
} 