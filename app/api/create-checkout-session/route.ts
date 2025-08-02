import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';
import { SecureLink } from '@/models/SecureLink';
import { doubleDecrypt } from '@/lib/encryption';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 CHECKOUT: Starting checkout session creation');
    
    const body = await request.json();
    const { plan, price, quantity, email, brandName, source } = body;

    console.log('🔍 CHECKOUT: Creating session for:', { plan, price, quantity, email, brandName });

    // Validate required fields
    if (!plan || !price || !email || !brandName) {
      console.error('❌ CHECKOUT: Missing required fields:', { plan, price, email, brandName });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if required environment variables are set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ CHECKOUT: STRIPE_SECRET_KEY not found in environment');
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }

    console.log('🔍 CHECKOUT: Connecting to database...');
    await dbConnect();
    console.log('✅ CHECKOUT: Database connected successfully');

    // Find the partner by brand name (more flexible search)
    console.log('🔍 CHECKOUT: Searching for brand:', brandName);
    let brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brandName, 'i') },
      isDeployed: true 
    });

    if (!brandSettings) {
      console.log('🔍 CHECKOUT: Brand not found with isDeployed=true, trying without requirement');
      // Try without isDeployed requirement
      brandSettings = await BrandSettings.findOne({ 
        brandName: { $regex: new RegExp(brandName, 'i') }
      });
    }

    if (!brandSettings) {
      console.log('❌ CHECKOUT: Brand not found:', brandName);
      const allBrands = await BrandSettings.find({}, { brandName: 1 });
      console.log('🔍 CHECKOUT: Available brands:', allBrands.map(b => b.brandName));
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    console.log('✅ CHECKOUT: Brand found:', brandSettings.brandName);

    // Find the partner user
    console.log('🔍 CHECKOUT: Looking for partner user with ID:', brandSettings.userId);
    const partnerUser = await PartnerUser.findById(brandSettings.userId);
    if (!partnerUser) {
      console.log('❌ CHECKOUT: Partner user not found for ID:', brandSettings.userId);
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }
    console.log('✅ CHECKOUT: Partner user found:', partnerUser.email);

    // Decrypt Stripe credentials
    let decryptedStripeSecretKey = '';
    let decryptedStripePublishableKey = '';
    
    try {
      if (partnerUser.stripeSecretKey) {
        decryptedStripeSecretKey = doubleDecrypt(partnerUser.stripeSecretKey);
        console.log('✅ CHECKOUT: Stripe secret key decrypted successfully');
      }
    } catch (e) {
      console.log('❌ CHECKOUT: Failed to decrypt Stripe secret key:', e);
    }
    
    try {
      if (partnerUser.stripePublishableKey) {
        decryptedStripePublishableKey = doubleDecrypt(partnerUser.stripePublishableKey);
        console.log('✅ CHECKOUT: Stripe publishable key decrypted successfully');
      }
    } catch (e) {
      console.log('❌ CHECKOUT: Failed to decrypt Stripe publishable key:', e);
    }

    // Extract quantity number from string like "10 QR Codes"
    const quantityNumber = parseInt(quantity?.match(/\d+/)?.[0] || '1');

    // Check if partner has enough secure links available
    console.log('🔍 CHECKOUT: Checking secure link availability for quantity:', quantityNumber);
    const availableSecureLinks = await SecureLink.countDocuments({
      partnerId: brandSettings.userId,
      isUsed: false,
      'metadata.sold': { $ne: true }
    });

    console.log('🔍 CHECKOUT: Available secure links:', availableSecureLinks, 'for partner:', brandSettings.userId);

    if (availableSecureLinks < quantityNumber) {
      console.log('❌ CHECKOUT: Not enough secure links available');
      console.log('❌ CHECKOUT: Available:', availableSecureLinks, 'Requested:', quantityNumber);
      return NextResponse.json({ 
        error: 'Encountering error please try again later' 
      }, { status: 400 });
    }

    console.log('✅ CHECKOUT: Sufficient secure links available');

    // Check if partner has Stripe credentials (using decrypted values)
    if (!decryptedStripePublishableKey || !decryptedStripeSecretKey) {
      console.log('❌ CHECKOUT: Partner missing Stripe credentials');
      console.log('🔍 CHECKOUT: Partner user:', {
        id: partnerUser._id,
        hasPublishableKey: !!partnerUser.stripePublishableKey,
        hasSecretKey: !!partnerUser.stripeSecretKey,
        decryptedPublishableKey: !!decryptedStripePublishableKey,
        decryptedSecretKey: !!decryptedStripeSecretKey
      });

      // If the request is from the website, do NOT fall back to the global Stripe key
      if (source === 'website') {
        return NextResponse.json({ error: 'This partner has not set up Stripe payments. Please contact the partner or try again later.' }, { status: 400 });
      }

      // For other flows, fall back to the main Stripe account (for testing)
      console.log('🔍 CHECKOUT: Using main Stripe account for testing');
      const testStripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-06-30.basil',
      });

      // Parse price to get amount in cents
      const priceAmount = parseFloat(price?.replace(/[^0-9.]/g, '') || '0');
      const amountInCents = Math.round(priceAmount * 100);

      // Validate amount
      if (amountInCents <= 0) {
        console.error('❌ CHECKOUT: Invalid price amount:', priceAmount);
        return NextResponse.json({ error: 'Invalid price amount' }, { status: 400 });
      }

      console.log('🔍 CHECKOUT: Creating Stripe session with test account');
      console.log('🔍 CHECKOUT: Session params:', {
        amountInCents,
        quantityNumber,
        plan,
        brandName,
        email
      });

      const session = await testStripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${plan} - ${quantity}`,
                description: `Purchase from ${brandName}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}&brand=${encodeURIComponent(brandSettings.userId)}&email=${encodeURIComponent(email)}&plan=${encodeURIComponent(plan)}&quantity=${encodeURIComponent(quantity)}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-cancel?brand=${encodeURIComponent(brandSettings.userId)}`,
        customer_email: email,
        metadata: {
          brandName,
          plan,
          quantity: quantityNumber.toString(),
          partnerId: brandSettings.userId,
          customerEmail: email,
        },
      });

      console.log('✅ CHECKOUT: Test session created:', session.id);
      return NextResponse.json({ 
        sessionUrl: session.url,
        sessionId: session.id 
      });
    }

    // Create Stripe checkout session using partner's credentials
    const partnerStripe = new Stripe(decryptedStripeSecretKey, {
      apiVersion: '2025-06-30.basil',
    });

    // Parse price to get amount in cents
    const priceAmount = parseFloat(price?.replace(/[^0-9.]/g, '') || '0');
    const amountInCents = Math.round(priceAmount * 100);

    // Validate amount
    if (amountInCents <= 0) {
      console.error('❌ CHECKOUT: Invalid price amount:', priceAmount);
      return NextResponse.json({ error: 'Invalid price amount' }, { status: 400 });
    }

    console.log('🔍 CHECKOUT: Creating Stripe session with partner account');
    console.log('🔍 CHECKOUT: Session params:', {
      amountInCents,
      quantityNumber,
      plan,
      brandName,
      email
    });

    const session = await partnerStripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan} - ${quantity}`,
              description: `Purchase from ${brandName}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}&brand=${encodeURIComponent(brandSettings.userId)}&email=${encodeURIComponent(email)}&plan=${encodeURIComponent(plan)}&quantity=${encodeURIComponent(quantity)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-cancel?brand=${encodeURIComponent(brandSettings.userId)}`,
      customer_email: email,
      metadata: {
        brandName,
        plan,
        quantity: quantityNumber.toString(),
        partnerId: brandSettings.userId,
        customerEmail: email,
      },
    });

    console.log('✅ CHECKOUT: Session created:', session.id);

    return NextResponse.json({ 
      sessionUrl: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('❌ CHECKOUT: Error creating session:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Encountering unknown error. Please try again later.';
    
    if (error instanceof Error) {
      console.error('❌ CHECKOUT: Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      if (error.message.includes('Stripe')) {
        errorMessage = 'Stripe configuration error. Please check your Stripe credentials.';
      } else if (error.message.includes('database')) {
        errorMessage = 'Database connection error. Please try again.';
      } else if (error.message.includes('MongoDB')) {
        errorMessage = 'Database connection error. Please try again.';
      } else if (error.message.includes('secure links')) {
        errorMessage = error.message; // Use the specific secure links error message
      } else {
        errorMessage = 'Encountering unknown error. Please try again later.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 