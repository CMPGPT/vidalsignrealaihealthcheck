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
    const { sessionId, email } = body;

    console.log('🔍 PROCESS STARTER PAYMENT: Processing for session:', sessionId, 'email:', email);

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

    // Check if this session has already been processed
    const existingPayment = await PaymentHistory.findOne({ 
      stripeSessionId: sessionId,
      status: 'completed'
    });

    if (existingPayment) {
      console.log('✅ PROCESS STARTER PAYMENT: Payment already processed');
      return NextResponse.json({ 
        success: true, 
        message: 'Payment already processed',
        secureLink: existingPayment.metadata?.secureLink
      });
    }

    // Generate a unique chat ID and link ID
    const chatId = `starter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const linkId = uuidv4();
    
    // Set expiry time to 24 hours from now for starter plan
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Create the secure link with a special partnerId for starter users
    const secureLink = await SecureLink.create({
      linkId,
      partnerId: 'starter-user', // Special identifier for starter users
      chatId,
      expiresAt,
      batchNo: 'basicstarter',
      isUsed: false,
      createdAt: new Date(),
      metadata: {
        plan: 'starter',
        customerEmail: email,
        amount: 100, // $1.00 in cents
        sessionId
      }
    });

    // Save payment history
    const paymentHistory = await PaymentHistory.create({
      partnerId: 'starter-user',
      transactionId: uuidv4(),
      packageName: 'Starter Plan - 1 QR Code',
      count: 1,
      amount: 1.00, // $1.00
      currency: 'usd',
      status: 'completed',
      paymentMethod: 'card',
      paymentDate: new Date(),
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent as string,
      metadata: {
        secureLink: linkId,
        customerEmail: email,
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
      await sendEmail(email, emailSubject, emailBody);
      console.log('✅ PROCESS STARTER PAYMENT: Email sent successfully');
    } catch (emailError) {
      console.error('❌ PROCESS STARTER PAYMENT: Failed to send email:', emailError);
      // Don't fail the entire process if email fails
    }

    console.log('✅ PROCESS STARTER PAYMENT: Payment processed successfully');

    return NextResponse.json({
      success: true,
      secureLink: linkId,
      chatId,
      expiresAt: expiresAt.toISOString(),
      message: 'Payment processed successfully'
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