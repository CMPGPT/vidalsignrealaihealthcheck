import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';
import { PaymentHistory } from '@/models/PaymentHistory';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from '@/lib/sendEmail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 PROCESS STARTER PAYMENT: Starting payment processing');

    const body = await request.json();
    const { sessionId, email, plan: planNameFromClient, quantity: quantityFromClient } = body;

    console.log('🔍 PROCESS STARTER PAYMENT: Processing for session:', sessionId, 'email:', email, 'plan:', planNameFromClient, 'quantity:', quantityFromClient);

    if (!sessionId || !email) {
      console.error('❌ PROCESS STARTER PAYMENT: Missing required fields');
      return NextResponse.json({ error: 'Missing sessionId or email' }, { status: 400 });
    }

    // Verify the payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      console.error('❌ PROCESS STARTER PAYMENT: Payment not completed');
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    await dbConnect();

    // Deduplication: Check if this session has already been processed
    const existingPayment = await PaymentHistory.findOne({
      stripeSessionId: sessionId,
      status: 'completed'
    });

    if (existingPayment) {
      console.log('✅ PROCESS STARTER PAYMENT: Payment already processed');
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        alreadyProcessed: true,
        metadata: existingPayment.metadata
      });
    }

    // Determine purchase quantity and plan
    const purchaseQuantity = parseInt((quantityFromClient as any) || (session.metadata?.quantity as any) || '1');
    const planName = (planNameFromClient as string) || (session.metadata?.plan as string) || 'VidalSigns Plan';

    // Generate secure links
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const secureLinks: string[] = [];
    for (let i = 0; i < purchaseQuantity; i++) {
      const linkId = uuidv4();
      const chatId = `vidalsigns-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;

      await SecureLink.create({
        linkId,
        partnerId: 'vidalsigns-main',
        chatId,
        expiresAt,
        batchNo: 'mainwebsite',
        isUsed: false,
        createdAt: new Date(),
        metadata: {
          plan: planName,
          customerEmail: email,
          amount: session.amount_total || 0,
          sessionId,
          purchaseQuantity,
          linkIndex: i + 1
        }
      });

      const secureLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/secure/chat/${linkId}`;
      secureLinks.push(secureLinkUrl);
    }

    // Save payment history
    const amountInDollars = (session.amount_total || 0) / 100;
    await PaymentHistory.create({
      partnerId: 'vidalsigns-main',
      transactionId: uuidv4(),
      packageName: `${planName} - ${purchaseQuantity} QR Code${purchaseQuantity > 1 ? 's' : ''}`,
      count: purchaseQuantity,
      amount: amountInDollars,
      currency: session.currency || 'usd',
      status: 'completed',
      paymentMethod: 'card',
      paymentDate: new Date(),
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent as string,
      metadata: {
        secureLinks,
        customerEmail: email,
        plan: planName,
        quantity: purchaseQuantity
      }
    });

    // Email
    const formatTime = (date: Date) => date.toISOString();
    const createdTimeFormatted = formatTime(new Date());
    const expiresTimeFormatted = formatTime(expiresAt);

    const linksHtml = secureLinks
      .map((link, index) => `
        <div style="margin-bottom: 15px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb;">
          <h4 style="color: #1e40af; margin: 0 0 10px 0;">QR Code ${index + 1}</h4>
          <a href="${link}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px 0;">
            Access QR Code ${index + 1}
          </a>
        </div>
      `)
      .join('');

    const emailSubject = `Your VidalSigns ${purchaseQuantity === 1 ? 'QR Code is' : `${purchaseQuantity} QR Codes are`} Ready!`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your VidalSigns ${purchaseQuantity === 1 ? 'QR Code is' : `${purchaseQuantity} QR Codes are`} Ready!</h2>
        <p>Thank you for purchasing ${planName}!</p>
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
      </div>
    `;

    try {
      await sendEmail(email, emailSubject, emailBody);
      console.log('✅ PROCESS STARTER PAYMENT: Email sent successfully');
    } catch (emailError) {
      console.error('❌ PROCESS STARTER PAYMENT: Failed to send email:', emailError);
      // Do not fail the whole flow if email fails
    }

    console.log('✅ PROCESS STARTER PAYMENT: Payment processed successfully');

    return NextResponse.json({
      success: true,
      generated: {
        secureLinks,
        quantity: purchaseQuantity
      }
    });

  } catch (error) {
    console.error('❌ PROCESS STARTER PAYMENT: Error processing payment:', error);
    
    let errorMessage = 'Failed to process payment. Please contact support.';
    
    if (error instanceof Error) {
      console.error('❌ PROCESS STARTER PAYMENT: Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      if (error.message.includes('Stripe')) {
        errorMessage = 'Payment verification failed. Please contact support.';
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