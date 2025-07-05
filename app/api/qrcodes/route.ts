import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { QRCode } from '@/models/QRCode';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const partnerId = request.nextUrl.searchParams.get('partnerId');
    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }
    const qrcodes = await QRCode.find({ partnerId }).lean();
    return NextResponse.json({ qrcodes });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 });
  }
} 