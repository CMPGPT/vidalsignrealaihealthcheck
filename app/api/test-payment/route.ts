import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';
import { SecureLink } from '@/models/SecureLink';
import { PartnerTransaction } from '@/models/PartnerTransaction';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, brand, email, plan, quantity } = body;

    console.log('🔍 TEST PAYMENT: Testing with data:', { sessionId, brand, email, plan, quantity });

    await dbConnect();

    // Find the brand settings
    const brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brand, 'i') },
      isDeployed: true 
    });

    if (!brandSettings) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Find the partner user
    const partnerUser = await PartnerUser.findById(brandSettings.userId);
    if (!partnerUser) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // Extract quantity number from string like "5 QR Codes"
    const quantityNumber = parseInt(quantity?.match(/\d+/)?.[0] || '1');
    console.log('🔍 TEST PAYMENT: Extracted quantity number:', quantityNumber);

    // Find unused secure links for this partner
    const unusedSecureLinks = await SecureLink.find({ 
      partnerId: brandSettings.userId,
      isUsed: false,
      'metadata.sold': { $ne: true }
    }).limit(quantityNumber);

    console.log('🔍 TEST PAYMENT: Found unused secure links:', unusedSecureLinks.length);

    if (unusedSecureLinks.length < quantityNumber) {
      return NextResponse.json({ 
        error: `Not enough unused secure links available. Partner has ${unusedSecureLinks.length} unused links but customer requested ${quantityNumber}.` 
      }, { status: 400 });
    }

    // Extract plan name and price
    const planName = plan.split(' - ')[0] || plan;
    const priceMatch = plan.match(/\$(\d+\.?\d*)/);
    let priceAmount = priceMatch ? parseFloat(priceMatch[1]) : 29.99;
    
    if (!priceMatch) {
      priceAmount = quantityNumber * 5.99; // $5.99 per QR code as default
    }

    console.log('🔍 TEST PAYMENT: Plan details:', { planName, priceAmount, quantityNumber });

    // Create PartnerTransaction record for this sale
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const transaction = await PartnerTransaction.create({
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
          partnerWebsiteUrl: brandSettings.websiteUrl,
          notes: `Customer purchase: ${planName} - ${quantityNumber} QR codes`
        }
      });
      
      console.log('✅ TEST PAYMENT: PartnerTransaction created successfully:', transaction.transactionId);
      
      return NextResponse.json({
        success: true,
        message: 'Test payment processed successfully!',
        transaction: {
          id: transaction.transactionId,
          type: transaction.transactionType,
          amount: transaction.totalAmount,
          customer: transaction.customerEmail,
          plan: transaction.planName,
          quantity: transaction.quantity
        }
      });
      
    } catch (transactionError) {
      console.error('❌ TEST PAYMENT: Failed to create PartnerTransaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create transaction record', details: transactionError instanceof Error ? transactionError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ TEST PAYMENT: Error:', error);
    return NextResponse.json(
      { error: 'Failed to process test payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 