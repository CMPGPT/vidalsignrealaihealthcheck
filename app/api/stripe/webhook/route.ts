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
      
      // Handle starter plan and main website payments (plan can be starter or a plan name from homepage)
      if (customerEmail && (plan === 'starter' || plan?.includes('QR Code'))) {
        console.log('🔍 WEBHOOK: Processing VidalSigns payment for:', customerEmail, 'Plan:', plan);
        
        // Get quantity from metadata, default to 1
        const purchaseQuantity = parseInt(session.metadata?.quantity || '1');
        
        // Check if this session has already been processed
        const existingPayment = await PaymentHistory.findOne({ 
          stripeSessionId: session.id,
          status: 'completed'
        });

        if (existingPayment) {
          console.log('✅ WEBHOOK: Payment already processed');
          return NextResponse.json({ received: true });
        }

        // Generate multiple secure links based on quantity
        const secureLinks = [];
        for (let i = 0; i < purchaseQuantity; i++) {
          const chatId = `vidalsigns-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
          const linkId = uuidv4();
          
          // Set expiry time to 24 hours from now
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);
          
          // Create the secure link
          const secureLink = await SecureLink.create({
            linkId,
            partnerId: 'vidalsigns-main', // Special identifier for main website users
            chatId,
            expiresAt,
            batchNo: plan === 'starter' ? 'basicstarter' : 'mainwebsite',
            isUsed: false,
            createdAt: new Date(),
            metadata: {
              plan: plan,
              customerEmail: customerEmail,
              amount: session.amount_total || 100,
              sessionId: session.id,
              purchaseQuantity: purchaseQuantity,
              linkIndex: i + 1
            }
          });
          
          const secureLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/secure/chat/${linkId}`;
          secureLinks.push(secureLinkUrl);
        }

        // Save payment history
        await PaymentHistory.create({
          partnerId: 'vidalsigns-main',
          transactionId: uuidv4(),
          packageName: `${plan} - ${purchaseQuantity} QR Code${purchaseQuantity > 1 ? 's' : ''}`,
          count: purchaseQuantity,
          amount: amount,
          currency: session.currency || 'usd',
          status: 'completed',
          paymentMethod: 'card',
          paymentDate: new Date(),
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          metadata: {
            secureLinks: secureLinks,
            customerEmail: customerEmail,
            plan: plan,
            quantity: purchaseQuantity
          }
        });

        // Generate email with multiple secure links
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        const formatTime = (date: Date) => {
          return date.toISOString();
        };

        const createdTimeFormatted = formatTime(new Date());
        const expiresTimeFormatted = formatTime(expiresAt);

        // Generate links HTML based on quantity
        const linksHtml = secureLinks.map((link, index) => `
          <div style="margin-bottom: 15px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0;">QR Code ${index + 1}</h4>
            <a href="${link}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px 0;">
              Access QR Code ${index + 1}
            </a>
          </div>
        `).join('');

        // Send email with the secure links
        const emailSubject = `Your VidalSigns ${purchaseQuantity === 1 ? 'QR Code is' : `${purchaseQuantity} QR Codes are`} Ready!`;
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Your VidalSigns ${purchaseQuantity === 1 ? 'QR Code is' : `${purchaseQuantity} QR Codes are`} Ready!</h2>
            <p>Thank you for purchasing ${plan}!</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Your Secure Link${purchaseQuantity > 1 ? 's' : ''}</h3>
              <p>Click the link${purchaseQuantity > 1 ? 's' : ''} below to access your QR code${purchaseQuantity > 1 ? 's' : ''} and start using VidalSigns:</p>
              
              ${linksHtml}
              
              <div style="margin-top: 15px; padding: 10px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>Created:</strong> ${createdTimeFormatted}<br>
                  <strong>Expires:</strong> ${expiresTimeFormatted}
                </p>
              </div>
            </div>
            
            <div style="background-color: #e7f5ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1e40af; margin-top: 0;">How to Use Your QR Code${purchaseQuantity > 1 ? 's' : ''}</h4>
              <ol style="color: #334155; line-height: 1.6;">
                <li>Click ${purchaseQuantity > 1 ? 'any of the secure links' : 'the secure link'} above</li>
                <li>Upload your lab report (PDF or image)</li>
                <li>Get instant AI-powered analysis in plain English</li>
                <li>Ask questions about your results</li>
                ${purchaseQuantity > 1 ? '<li>Each link can be used for a separate report analysis</li>' : ''}
              </ol>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              ${purchaseQuantity > 1 ? 'Each secure link is' : 'This secure link is'} valid for 24 hours and can only be used once. If you need help, reply to this email or contact our support team.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              This email was sent from VidalSigns. Thank you for choosing us for your health analysis needs.
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