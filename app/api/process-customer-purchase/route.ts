import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';
import { SecureLink } from '@/models/SecureLink';
import { QRCode } from '@/models/QRCode';
import { v4 as uuidv4 } from 'uuid';
import { sendSecureLinksEmail, sendPartnerNotificationEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, brand, email, plan, quantity } = body;

    console.log('🔍 CUSTOMER PURCHASE: Processing customer purchase for:', { sessionId, brand, email, plan, quantity });

    // Validate required fields
    if (!sessionId || !brand || !email || !plan || !quantity) {
      console.error('❌ CUSTOMER PURCHASE: Missing required fields:', { sessionId, brand, email, plan, quantity });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Find the partner by brand name
    const brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brand, 'i') },
      isDeployed: true 
    });

    if (!brandSettings) {
      console.log('❌ CUSTOMER PURCHASE: Brand not found:', brand);
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Find the partner user
    const partnerUser = await PartnerUser.findById(brandSettings.userId);
    if (!partnerUser) {
      console.log('❌ CUSTOMER PURCHASE: Partner user not found');
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Find unused secure links for this partner (that are not partner-owned)
    const unusedSecureLinks = await SecureLink.find({ 
      partnerId: brandSettings.userId,
      isUsed: false,
      'metadata.partnerOwned': { $ne: true } // Exclude partner-owned secure links
    }).limit(quantity);

    console.log('🔍 CUSTOMER PURCHASE: Found unused secure links:', unusedSecureLinks.length, 'for partner:', brandSettings.userId);

    if (unusedSecureLinks.length < quantity) {
      console.log('❌ CUSTOMER PURCHASE: Not enough unused secure links available');
      return NextResponse.json({ 
        error: `Not enough unused secure links available. Partner has ${unusedSecureLinks.length} unused links but customer requested ${quantity}. Partner needs to purchase more QR codes.` 
      }, { status: 400 });
    }

    // Assign existing secure links to customer
    const generatedItems = {
      secureLinks: [] as string[],
      qrCodes: [] as string[]
    };

    // Assign unused secure links to customer
    for (let i = 0; i < quantity; i++) {
      const secureLink = unusedSecureLinks[i];
      
      // Update secure link to assign it to customer
      await SecureLink.findByIdAndUpdate(secureLink._id, {
        // Add metadata to track the purchase
        metadata: {
          ...secureLink.metadata,
          customerEmail: email,
          brandName: brandSettings.brandName,
          plan: plan,
          purchaseDate: new Date(),
          purchaseQuantity: quantity,
          sold: true, // Mark as sold
          soldDate: new Date()
        }
      });
      
      const secureUrl = `${process.env.NEXT_PUBLIC_APP_URL}/secure/chat/${secureLink.linkId}`;
      generatedItems.secureLinks.push(secureUrl);
      generatedItems.qrCodes.push(secureLink.metadata?.qrCodeId || 'N/A');
    }

    // Update partner's usage statistics (only increment secure links, not QR codes since we're using existing ones)
    await PartnerUser.findByIdAndUpdate(brandSettings.userId, {
      $inc: {
        secureLinksGenerated: quantity,
        // qrCodesCreated: quantity, // Don't increment since we're using existing QR codes
      }
    });

    // Notify partner dashboard to refresh (this will trigger a real-time update)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notify-partner-dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: brandSettings.userId,
          action: 'customer_purchase',
          quantity: quantity,
          customerEmail: email
        }),
      });
    } catch (notificationError) {
      console.error('❌ CUSTOMER PURCHASE: Failed to notify partner dashboard:', notificationError);
      // Don't fail the purchase if notification fails
    }

    console.log('✅ CUSTOMER PURCHASE: Generated items:', {
      secureLinks: generatedItems.secureLinks.length,
      qrCodes: generatedItems.qrCodes.length
    });

    // Send email to customer with secure links and QR codes from partner's email
    try {
      const partnerName = `${partnerUser.first_Name} ${partnerUser.last_Name}`;
      
      // Extract plan name and price from the plan string (e.g., "Basic Plan - $29.99")
      const planName = plan.split(' - ')[0] || plan;
      const priceMatch = plan.match(/\$(\d+\.?\d*)/);
      const priceAmount = priceMatch ? parseFloat(priceMatch[1]) : 0;
      
      // Send email to customer
      await sendSecureLinksEmail(
        email, // customer email
        partnerUser.email, // partner email (for reference)
        partnerName, // partner name
        brandSettings.brandName, // brand name
        generatedItems.secureLinks, // secure links
        generatedItems.qrCodes, // QR codes
        planName, // plan name (without price)
        quantity // quantity
      );
      
      // Send notification to partner
      await sendPartnerNotificationEmail(
        partnerUser.email, // partner email
        partnerName, // partner name
        brandSettings.brandName, // brand name
        email, // customer email
        planName, // plan name (without price)
        quantity, // quantity
        priceAmount // amount
      );
      
      console.log('✅ CUSTOMER PURCHASE: Emails sent successfully');
      console.log('✅ CUSTOMER PURCHASE: Customer email sent to:', email);
      console.log('✅ CUSTOMER PURCHASE: Partner notification sent to:', partnerUser.email);
    } catch (emailError) {
      console.error('❌ CUSTOMER PURCHASE: Email sending failed:', emailError);
      console.error('❌ CUSTOMER PURCHASE: Email error details:', {
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined
      });
      // Don't fail the entire process if email fails
    }

    return NextResponse.json({ 
      success: true,
      generatedItems,
      message: `Payment processed successfully! ${quantity} secure links and QR codes have been generated and sent to your email. The partner has also been notified of your purchase.`
    });

  } catch (error) {
    console.error('❌ CUSTOMER PURCHASE: Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 