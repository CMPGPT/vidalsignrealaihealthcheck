import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import BrandSettings from '@/models/BrandSettings';
import { sendPartnerNotificationEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const { linkId, partnerId, customerEmail, chatId } = await request.json();

    console.log('🔍 PARTNER NOTIFICATION: Link used:', { linkId, partnerId, customerEmail, chatId });

    await dbConnect();

    // Find the partner
    const partnerUser = await PartnerUser.findById(partnerId);
    if (!partnerUser) {
      console.log('❌ PARTNER NOTIFICATION: Partner not found:', partnerId);
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Find the brand settings
    const brandSettings = await BrandSettings.findOne({ userId: partnerId });
    if (!brandSettings) {
      console.log('❌ PARTNER NOTIFICATION: Brand settings not found for partner:', partnerId);
      return NextResponse.json({ error: 'Brand settings not found' }, { status: 404 });
    }

    // Send notification email to partner
    try {
      const partnerName = `${partnerUser.first_Name} ${partnerUser.last_Name}`;
      
      await sendPartnerNotificationEmail(
        partnerUser.email, // partner email
        partnerName, // partner name
        brandSettings.brandName, // brand name
        customerEmail || 'Unknown', // customer email
        'Secure Link Used', // type of notification
        1, // quantity (1 link used)
        0 // amount (no charge for usage)
      );
      
      console.log('✅ PARTNER NOTIFICATION: Email sent to partner:', partnerUser.email);
    } catch (emailError) {
      console.error('❌ PARTNER NOTIFICATION: Email sending failed:', emailError);
      // Don't fail the process if email fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Partner notified successfully'
    });

  } catch (error) {
    console.error('❌ PARTNER NOTIFICATION: Error:', error);
    return NextResponse.json(
      { error: 'Failed to notify partner' },
      { status: 500 }
    );
  }
} 