import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const config = {
      stripe: {
        secretKey: !!process.env.STRIPE_SECRET_KEY,
        webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
      },
      email: {
        gmailUser: !!process.env.GMAIL_USER,
        gmailPassword: !!process.env.GMAIL_APP_PASSWORD
      },
      app: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      }
    };

    const allConfigured = config.stripe.secretKey && config.email.gmailUser && config.email.gmailPassword;

    return NextResponse.json({
      success: true,
      configured: allConfigured,
      config
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Configuration check failed'
    }, { status: 500 });
  }
} 