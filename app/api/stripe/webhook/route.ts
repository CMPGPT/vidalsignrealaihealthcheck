import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';
import { PaymentHistory } from '@/models/PaymentHistory';
import { PartnerTransaction } from '@/models/PartnerTransaction';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const isDevelopment = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;

    let event;
    
    // Skip signature verification in development mode or if using test signature
    if (isDevelopment || signature === 'test_signature') {
      event = JSON.parse(body);
    } else {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        return NextResponse.json({ error: `Webhook signature verification failed: ${err}` }, { status: 400 });
      }
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract metadata
      const partnerId = session.metadata?.partnerId;
      const count = parseInt(session.metadata?.count || '0');
      const packageName = session.metadata?.packageName;
      const transactionId = session.metadata?.transactionId || uuidv4();
      const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents to dollars
      
      if (partnerId && count > 0) {
        await dbConnect();
        
        // Save payment history
        await PaymentHistory.create({
          partnerId,
          transactionId,
          packageName,
          count,
          amount,
          currency: session.currency || 'usd',
          status: 'completed',
          paymentMethod: 'card',
          paymentDate: new Date(),
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string
        });

        // Create PartnerTransaction record for this purchase
        await PartnerTransaction.create({
          partnerId,
          transactionType: 'purchase',
          transactionId,
          planName: packageName || 'QR Code Package',
          planPrice: amount,
          quantity: count,
          totalAmount: amount,
          currency: session.currency?.toUpperCase() || 'USD',
          paymentMethod: 'stripe',
          status: 'completed',
          transactionDate: new Date(),
          metadata: {
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            notes: `Partner purchase: ${packageName} - ${count} QR codes`
          }
        });
        
        // Generate the specified number of secure links
        const secureLinks = [];
        for (let i = 0; i < count; i++) {
          // Generate a unique chat ID for each link
          const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
          const linkId = uuidv4();
          
          // Set expiry time (default 1 year from now)
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          
          // Create the secure link
          const secureLink = {
            linkId,
            partnerId,
            chatId,
            expiresAt,
            isUsed: false,
            createdAt: new Date()
          };
          
          secureLinks.push(secureLink);
        }
        
        // Save all secure links in bulk
        await SecureLink.insertMany(secureLinks);
        
        console.log(`Generated ${count} secure links for partner ${partnerId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// This is needed to properly parse the request body
export const config = {
  api: {
    bodyParser: false,
  },
}; 