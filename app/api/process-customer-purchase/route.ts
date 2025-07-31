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

    console.log('🔍 CUSTOMER PURCHASE: Processing customer purchase for:', { sessionId, brand, email, plan, quantity });

    // Validate required fields
    if (!sessionId || !brand || !email || !plan || !quantity) {
      console.error('❌ CUSTOMER PURCHASE: Missing required fields:', { sessionId, brand, email, plan, quantity });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Check if this session has already been processed
    const existingProcessedSession = await SecureLink.findOne({
      'metadata.sessionId': sessionId,
      'metadata.processed': true
    });

    if (existingProcessedSession) {
      console.log('✅ CUSTOMER PURCHASE: Session already processed:', sessionId);
      return NextResponse.json({ 
        success: true,
        message: 'Payment already processed. Your QR codes have been sent to your email.',
        alreadyProcessed: true
      });
    }

    // Check if PartnerTransaction already exists for this session
    const existingTransaction = await PartnerTransaction.findOne({
      'metadata.stripeSessionId': sessionId
    });

    if (existingTransaction) {
      console.log('✅ CUSTOMER PURCHASE: Transaction already exists for session:', sessionId);
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
      console.log('❌ CUSTOMER PURCHASE: Brand not found:', brand);
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Find the partner user
    const partnerUser = await PartnerUser.findById(brandSettings.userId);
    if (!partnerUser) {
      console.log('❌ CUSTOMER PURCHASE: Partner user not found');
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Extract quantity number from string like "5 QR Codes"
    const quantityNumber = parseInt(quantity?.match(/\d+/)?.[0] || '1');
    console.log('🔍 CUSTOMER PURCHASE: Extracted quantity number:', quantityNumber, 'from quantity string:', quantity);

    // Find unused secure links for this partner (including partner-owned ones that can be sold)
    const unusedSecureLinks = await SecureLink.find({ 
      partnerId: brandSettings.userId,
      isUsed: false,
      'metadata.sold': { $ne: true } // Only exclude already sold links
    }).limit(quantityNumber);

    console.log('🔍 CUSTOMER PURCHASE: Found unused secure links:', unusedSecureLinks.length, 'for partner:', brandSettings.userId);

    if (unusedSecureLinks.length < quantityNumber) {
      console.log('❌ CUSTOMER PURCHASE: Not enough unused secure links available');
      return NextResponse.json({ 
        error: `Not enough unused secure links available. Partner has ${unusedSecureLinks.length} unused links but customer requested ${quantityNumber}. Partner needs to purchase more QR codes.` 
      }, { status: 400 });
    }

    // Assign existing secure links to customer
    const generatedItems = {
      secureLinks: [] as string[],
      qrCodes: [] as string[]
    };

    // Assign unused secure links to customer
    for (let i = 0; i < quantityNumber; i++) {
      const secureLink = unusedSecureLinks[i];
      
      // Set expiry time to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Update secure link to assign it to customer
      await SecureLink.findByIdAndUpdate(secureLink._id, {
        expiresAt: expiresAt, // Set 24-hour expiry
        // Add metadata to track the purchase
        metadata: {
          ...secureLink.metadata,
          customerEmail: email,
          brandName: brandSettings.brandName,
          plan: plan,
          purchaseDate: new Date(),
          purchaseQuantity: quantityNumber,
          sold: true, // Mark as sold
          soldDate: new Date(),
          sessionId: sessionId, // Track the session ID
          processed: true // Mark as processed
        }
      });
      
      const secureUrl = `${process.env.NEXT_PUBLIC_APP_URL}/secure/chat/${secureLink.linkId}`;
      generatedItems.secureLinks.push(secureUrl);
      generatedItems.qrCodes.push(secureLink.metadata?.qrCodeId || 'N/A');
    }

    // Extract plan name and price from the plan string (e.g., "Basic Plan - $29.99")
    // Extract plan name from the plan string (e.g., "Basic Plan - $29.99")
    const planName = plan.split(' - ')[0] || plan;
    
    // Extract exact price from the plan string - critical for correct billing
    const priceMatch = plan.match(/\$(\d+\.?\d*)/);
    if (!priceMatch) {
      console.error('❌ CUSTOMER PURCHASE: Could not extract price from plan string:', plan);
      return NextResponse.json({ error: 'Invalid plan price format. Please contact support.' }, { status: 400 });
    }
    
    // Use the exact price from the plan string (from branding/pricing section)
    const priceAmount = parseFloat(priceMatch[1]);
    console.log('✅ CUSTOMER PURCHASE: Extracted price:', priceAmount, 'from plan string:', plan);
    
    // Validate the price
    if (isNaN(priceAmount) || priceAmount <= 0) {
      console.error('❌ CUSTOMER PURCHASE: Invalid price amount:', priceAmount);
      return NextResponse.json({ error: 'Invalid price amount. Please contact support.' }, { status: 400 });
    }

    // Create PartnerTransaction record for this sale
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔍 CUSTOMER PURCHASE: Creating PartnerTransaction with data:', {
      partnerId: brandSettings.userId,
      transactionType: 'sale',
      transactionId,
      customerEmail: email,
      planName,
      planPrice: priceAmount,
      quantity: quantityNumber,
      totalAmount: priceAmount
    });
    
    try {
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
      console.log('✅ CUSTOMER PURCHASE: PartnerTransaction created successfully');
    } catch (transactionError) {
      console.error('❌ CUSTOMER PURCHASE: Failed to create PartnerTransaction:', transactionError);
      // Don't fail the entire process if transaction creation fails
    }

    // Update partner's usage statistics (only increment secure links, not QR codes since we're using existing ones)
    await PartnerUser.findByIdAndUpdate(brandSettings.userId, {
      $inc: {
        secureLinksGenerated: quantityNumber,
        // qrCodesCreated: quantity, // Don't increment since we're using existing QR codes
      }
    });

    // Notify partner dashboard to refresh (non-blocking)
    try {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notify-partner-dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: brandSettings.userId,
          action: 'customer_purchase',
          quantity: quantityNumber,
          customerEmail: email
        }),
      }).catch(notificationError => {
        console.error('❌ CUSTOMER PURCHASE: Failed to notify partner dashboard:', notificationError);
      });
    } catch (notificationError) {
      console.error('❌ CUSTOMER PURCHASE: Failed to setup partner dashboard notification:', notificationError);
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
      
      console.log('🔍 CUSTOMER PURCHASE: Sending emails...');
      
      // Send email to customer (non-blocking)
      sendSecureLinksEmail(
        email, // customer email
        partnerUser.email, // partner email (for reference)
        partnerName, // partner name
        brandSettings.brandName, // brand name
        generatedItems.secureLinks, // secure links
        generatedItems.qrCodes, // QR codes
        planName, // plan name (without price)
        quantityNumber // quantity
      ).catch(emailError => {
        console.error('❌ CUSTOMER PURCHASE: Customer email failed:', emailError);
      });
      
      // Send notification to partner (non-blocking)
      sendPartnerNotificationEmail(
        partnerUser.email, // partner email
        partnerName, // partner name
        brandSettings.brandName, // brand name
        email, // customer email
        planName, // plan name (without price)
        quantityNumber, // quantity
        priceAmount // amount
      ).catch(emailError => {
        console.error('❌ CUSTOMER PURCHASE: Partner notification failed:', emailError);
      });
      
      console.log('✅ CUSTOMER PURCHASE: Email requests sent (non-blocking)');
    } catch (emailError) {
      console.error('❌ CUSTOMER PURCHASE: Email setup failed:', emailError);
      // Don't fail the entire process if email fails
    }

    return NextResponse.json({ 
      success: true,
      generatedItems,
      message: `Payment processed successfully! ${quantityNumber} secure links and QR codes have been generated and sent to your email. The partner has also been notified of your purchase.`
    });

  } catch (error) {
    console.error('❌ CUSTOMER PURCHASE: Error processing payment:', error);
    console.error('❌ CUSTOMER PURCHASE: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 