import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 STARTER CHECKOUT: Starting checkout session creation');
    
    const body = await request.json();
    const { email, plan, amount, quantity } = body;

    console.log('🔍 STARTER CHECKOUT: Creating session for:', { plan, amount, email, quantity });

    // Validate required fields
    if (!email || !plan || !amount) {
      console.error('❌ STARTER CHECKOUT: Missing required fields:', { plan, amount, email });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if required environment variables are set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STARTER CHECKOUT: STRIPE_SECRET_KEY not found in environment');
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }

    // Extract quantity for URL and metadata
    const qrQuantity = quantity || 1;
    const planDescription = qrQuantity === 1 ? '1 QR Code with 24-hour access' : `${qrQuantity} QR Codes with 24-hour access`;

    console.log('🔍 STARTER CHECKOUT: Creating Stripe session');
    console.log('🔍 STARTER CHECKOUT: Session params:', {
      amount,
      plan,
      email,
      quantity: qrQuantity
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `VidalSigns - ${plan}`,
              description: planDescription,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/starter-payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan)}&email=${encodeURIComponent(email)}&quantity=${qrQuantity}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-cancel?plan=${encodeURIComponent(plan)}`,
      customer_email: email,
      metadata: {
        plan: plan,
        customerEmail: email,
        amount: amount.toString(),
        quantity: qrQuantity.toString(),
      },
    });

    console.log('✅ STARTER CHECKOUT: Session created:', session.id);

    return NextResponse.json({ 
      success: true,
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('❌ STARTER CHECKOUT: Error creating session:', error);
    
    let errorMessage = 'Failed to create checkout session. Please try again.';
    
    if (error instanceof Error) {
      console.error('❌ STARTER CHECKOUT: Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      if (error.message.includes('Stripe')) {
        errorMessage = 'Payment service error. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 