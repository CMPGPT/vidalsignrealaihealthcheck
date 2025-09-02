import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const config = {
      stripe: {
        secretKey: !!process.env.STRIPE_SECRET_KEY,
        webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET
      },
      email: {
        host: !!process.env.SMTP_HOST,
        port: !!process.env.SMTP_PORT,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS,
        from: !!process.env.SMTP_FROM,
      },
      app: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      }
    };

    const allConfigured = config.stripe.secretKey && config.email.host && config.email.port && config.email.user && config.email.pass && config.email.from;

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