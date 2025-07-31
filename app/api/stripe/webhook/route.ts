import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';
import { PaymentHistory } from '@/models/PaymentHistory';
import { PartnerTransaction } from '@/models/PartnerTransaction';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from '@/lib/sendEmail';

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
      const plan = session.metadata?.plan;
      const customerEmail = session.metadata?.customerEmail;
      const count = parseInt(session.metadata?.count || '0');
      const packageName = session.metadata?.packageName;
      const transactionId = session.metadata?.transactionId || uuidv4();
      const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents to dollars
      
      await dbConnect();
      
      // Handle starter plan payments
      if (plan === 'starter' && customerEmail) {
        console.log('🔍 WEBHOOK: Processing starter plan payment for:', customerEmail);
        
        // Check if this session has already been processed
        const existingPayment = await PaymentHistory.findOne({ 
          stripeSessionId: session.id,
          status: 'completed'
        });

        if (existingPayment) {
          console.log('✅ WEBHOOK: Starter payment already processed');
          return NextResponse.json({ received: true });
        }

        // Generate a unique chat ID and link ID
        const chatId = `starter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const linkId = uuidv4();
        
        // Set expiry time to 24 hours from now for starter plan
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        // Create the secure link with a special partnerId for starter users
        await SecureLink.create({
          linkId,
          partnerId: 'starter-user', // Special identifier for starter users
          chatId,
          expiresAt,
          batchNo: 'basicstarter',
          isUsed: false,
          createdAt: new Date(),
          metadata: {
            plan: 'starter',
            customerEmail: customerEmail,
            amount: session.amount_total || 100,
            sessionId: session.id
          }
        });

        // Save payment history
        await PaymentHistory.create({
          partnerId: 'starter-user',
          transactionId: uuidv4(),
          packageName: 'Starter Plan - 1 QR Code',
          count: 1,
          amount: amount,
          currency: session.currency || 'usd',
          status: 'completed',
          paymentMethod: 'card',
          paymentDate: new Date(),
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          metadata: {
            secureLink: linkId,
            customerEmail: customerEmail,
            plan: 'starter'
          }
        });

        // Generate the secure link URL using the linkId from database
        const secureLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/secure/chat/${linkId}`;

        // Format timestamps for email in ISO format
        const formatTime = (date: Date) => {
          return date.toISOString();
        };

        const createdTimeFormatted = formatTime(new Date());
        const expiresTimeFormatted = formatTime(expiresAt);

        // Send email with the secure link
        const emailSubject = 'Your VidalSigns QR Code is Ready!';
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Your VidalSigns QR Code is Ready!</h2>
            <p>Thank you for purchasing the VidalSigns Starter Plan!</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Your Secure Link</h3>
              <p>Click the link below to access your QR code and start using VidalSigns:</p>
              <a href="${secureLinkUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
                Access Your QR Code
              </a>
              <div style="margin-top: 15px; padding: 10px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>Created:</strong> ${createdTimeFormatted}<br>
                  <strong>Expires:</strong> ${expiresTimeFormatted}
                </p>
              </div>
            </div>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534; margin-top: 0;">What's Included</h3>
              <ul style="color: #374151;">
                <li>1 QR code for patient access</li>
                <li>24-hour access period</li>
                <li>Basic patient portal</li>
                <li>HIPAA compliant</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p style="color: #64748b; font-size: 14px;">
              Best regards,<br>
              The VidalSigns Team
            </p>
          </div>
        `;

        try {
          await sendEmail(customerEmail, emailSubject, emailBody);
          console.log('✅ WEBHOOK: Email sent successfully to:', customerEmail);
        } catch (emailError) {
          console.error('❌ WEBHOOK: Failed to send email:', emailError);
          // Don't fail the entire process if email fails
        }

        console.log('✅ WEBHOOK: Starter plan payment processed successfully');
      }
      // Handle partner payments
      else if (partnerId && count > 0) {
        console.log('🔍 WEBHOOK: Processing partner payment for:', partnerId);
        
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