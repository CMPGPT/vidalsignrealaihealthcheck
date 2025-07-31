import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 STARTER CHECKOUT: Starting checkout session creation');
    
    const body = await request.json();
    const { email, plan, amount } = body;

    console.log('🔍 STARTER CHECKOUT: Creating session for:', { plan, amount, email });

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

    // Validate amount (should be 100 cents = $1.00)
    if (amount !== 100) {
      console.error('❌ STARTER CHECKOUT: Invalid amount:', amount);
      return NextResponse.json({ error: 'Invalid amount for Starter plan' }, { status: 400 });
    }

    console.log('🔍 STARTER CHECKOUT: Creating Stripe session');
    console.log('🔍 STARTER CHECKOUT: Session params:', {
      amount,
      plan,
      email
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'VidalSigns Starter Plan',
              description: '1 QR Code with 24-hour access',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/starter-payment-success?session_id={CHECKOUT_SESSION_ID}&plan=starter&email=${encodeURIComponent(email)}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-cancel?plan=starter`,
      customer_email: email,
      metadata: {
        plan: 'starter',
        customerEmail: email,
        amount: amount.toString(),
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