import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';
import { SecureLink } from '@/models/SecureLink';
import { QRCode } from '@/models/QRCode';
import { PartnerTransaction } from '@/models/PartnerTransaction';
import { v4 as uuidv4 } from 'uuid';
import { sendSecureLinksEmail, sendPartnerNotificationEmail } from '@/lib/sendEmail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, brand, email, plan, quantity } = body;

    console.log('🔍 PAYMENT PROCESSING: Processing payment for:', { sessionId, brand, email, plan, quantity });

    // Validate required fields
    if (!sessionId || !brand || !email || !plan || !quantity) {
      console.error('❌ PAYMENT PROCESSING: Missing required fields:', { sessionId, brand, email, plan, quantity });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Check if this session has already been processed
    const existingProcessedSession = await SecureLink.findOne({
      'metadata.sessionId': sessionId,
      'metadata.processed': true
    });

    if (existingProcessedSession) {
      console.log('✅ PAYMENT PROCESSING: Session already processed:', sessionId);
      return NextResponse.json({ 
        success: true,
        message: 'Payment already processed. Your QR codes have been sent to your email.',
        alreadyProcessed: true
      });
    }

    // Find the partner by brand name
    const brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brand, 'i') },
      isDeployed: true 
    });

    if (!brandSettings) {
      console.log('❌ PAYMENT PROCESSING: Brand not found:', brand);
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Find the partner user
    const partnerUser = await PartnerUser.findById(brandSettings.userId);
    if (!partnerUser) {
      console.log('❌ PAYMENT PROCESSING: Partner user not found');
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Extract quantity number from string like "5 QR Codes"
    const quantityNumber = parseInt(quantity?.match(/\d+/)?.[0] || '1');
    console.log('🔍 PAYMENT PROCESSING: Extracted quantity number:', quantityNumber, 'from quantity string:', quantity);

    // Find unused QR codes for this partner
    const unusedQRCodes = await QRCode.find({ 
      partnerId: brandSettings.userId,
      assigned: false,
      used: false
    }).limit(quantityNumber);

    console.log('🔍 PAYMENT PROCESSING: Found unused QR codes:', unusedQRCodes.length, 'for partner:', brandSettings.userId);

    if (unusedQRCodes.length < quantityNumber) {
      console.log('❌ PAYMENT PROCESSING: Not enough unused QR codes available');
      return NextResponse.json({ 
        error: `encounting error please try again later` 
      }, { status: 400 });
    }

    // Generate secure links and assign QR codes
    const generatedItems = {
      secureLinks: [] as string[],
      qrCodes: [] as string[]
    };

    // Assign unused QR codes to customer and create secure links
    for (let i = 0; i < quantityNumber; i++) {
      const qrCode = unusedQRCodes[i];
      
      // Create secure link for this QR code
      const linkId = uuidv4();
      const secureLink = new SecureLink({
        linkId,
        partnerId: brandSettings.userId,
        chatId: `chat_${Date.now()}_${i}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        // Add metadata to track the purchase
        metadata: {
          customerEmail: email,
          brandName: brandSettings.brandName,
          plan: plan,
          purchaseDate: new Date(),
          purchaseQuantity: quantityNumber,
          qrCodeId: qrCode.id, // Link to the QR code
          sessionId: sessionId, // Track the session ID
          processed: true // Mark as processed
        }
      });
      await secureLink.save();
      
      // Update QR code to assign it to customer
      await QRCode.findByIdAndUpdate(qrCode._id, {
        customerName: email,
        customerId: email,
        assigned: true,
        assignedDate: new Date(),
        used: false, // Will be marked as used when customer uses the secure link
        metadata: {
          plan: plan,
          description: `Assigned to ${email}`,
          isActive: true,
          usageCount: 0,
          maxUsage: 1,
          secureLinkId: linkId
        }
      });
      
      const secureUrl = `${process.env.NEXT_PUBLIC_APP_URL}/secure/chat/${linkId}`;
      generatedItems.secureLinks.push(secureUrl);
      generatedItems.qrCodes.push(qrCode.id);
    }

    // Extract plan name and price from the plan string (e.g., "Basic Plan - $29.99")
    // Extract plan name from the plan string (e.g., "Basic Plan - $29.99")
    const planName = plan.split(' - ')[0] || plan;
    
    // Extract exact price from the plan string - critical for correct billing
    const priceMatch = plan.match(/\$(\d+\.?\d*)/);
    if (!priceMatch) {
      console.error('❌ PAYMENT PROCESSING: Could not extract price from plan string:', plan);
      return NextResponse.json({ error: 'Encountering error please try again later' }, { status: 400 });
    }
    
    // Use the exact price from the plan string (from branding/pricing section)
    const priceAmount = parseFloat(priceMatch[1]);
    console.log('✅ PAYMENT PROCESSING: Extracted price:', priceAmount, 'from plan string:', plan);
    
    // Validate the price
    if (isNaN(priceAmount) || priceAmount <= 0) {
      console.error('❌ PAYMENT PROCESSING: Invalid price amount:', priceAmount);
      return NextResponse.json({ error: 'Encountering error please try again later' }, { status: 400 });
    }

    // Create PartnerTransaction record for this sale
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await PartnerTransaction.create({
      partnerId: brandSettings.userId,
      transactionType: 'sale',
      transactionId,
      customerEmail: email,
      planName,
      planPrice: priceAmount,
      quantity: quantityNumber,
      totalAmount: priceAmount,
      currency: 'USD',
      paymentMethod: 'stripe',
      status: 'completed',
      transactionDate: new Date(),
      metadata: {
        stripeSessionId: sessionId,
        secureLinkIds: generatedItems.secureLinks,
        qrCodeIds: generatedItems.qrCodes,
        partnerWebsiteUrl: brandSettings.websiteUrl,
        notes: `Customer purchase: ${planName} - ${quantityNumber} QR codes`
      }
    });

    // Update partner's usage statistics (only increment secure links, not QR codes since we're using existing ones)
    await PartnerUser.findByIdAndUpdate(brandSettings.userId, {
      $inc: {
        secureLinksGenerated: quantityNumber,
        // qrCodesCreated: quantity, // Don't increment since we're using existing QR codes
      }
    });

    console.log('✅ PAYMENT PROCESSING: Generated items:', {
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
        quantityNumber // quantity
      );
      
      // Send notification to partner
      await sendPartnerNotificationEmail(
        partnerUser.email, // partner email
        partnerName, // partner name
        brandSettings.brandName, // brand name
        email, // customer email
        planName, // plan name (without price)
        quantityNumber, // quantity
        priceAmount // amount
      );
      
      console.log('✅ PAYMENT PROCESSING: Emails sent successfully');
      console.log('✅ PAYMENT PROCESSING: Customer email sent to:', email);
      console.log('✅ PAYMENT PROCESSING: Partner notification sent to:', partnerUser.email);
    } catch (emailError) {
      console.error('❌ PAYMENT PROCESSING: Email sending failed:', emailError);
      console.error('❌ PAYMENT PROCESSING: Email error details:', {
        message: emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined
      });
      // Don't fail the entire process if email fails
    }

    return NextResponse.json({ 
      success: true,
      generatedItems,
      message: `Payment processed successfully! ${quantityNumber} secure links and QR codes have been generated and sent to your email. The partner has also been notified of your purchase.`
    });

  } catch (error) {
    console.error('❌ PAYMENT PROCESSING: Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 