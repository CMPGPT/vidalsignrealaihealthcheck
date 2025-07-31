import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/dbConnect';
import PublicLink from '@/models/PublicLink';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if environment variables are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Missing environment variables:', {
        GMAIL_USER: process.env.GMAIL_USER ? 'SET' : 'MISSING',
        GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'SET' : 'MISSING'
      });
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if user has created a link within the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const existingLink = await PublicLink.findOne({
      email: email,
      createdAt: { $gte: fourteenDaysAgo }
    });

    if (existingLink) {
      // Calculate remaining days
      const linkCreatedAt = new Date(existingLink.createdAt);
      const daysSinceCreation = Math.ceil((new Date().getTime() - linkCreatedAt.getTime()) / (1000 * 60 * 60 * 24));
      const remainingDays = 14 - daysSinceCreation;

      return NextResponse.json(
        { 
          success: false, 
          error: `You have already used your limit. Please wait ${remainingDays} more day${remainingDays !== 1 ? 's' : ''} before requesting another link.`,
          limitReached: true,
          remainingDays: remainingDays
        },
        { status: 429 }
      );
    }

    // Generate unique chat ID
    const chatId = uuidv4();
    const chatLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/chat/${chatId}`;

    // Create PublicLink record in database
    const publicLink = new PublicLink({
      chatId: chatId,
      email: email,
      isOpen: true,
      fileUploadCount: 0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      isUsed: false
    });

    await publicLink.save();

    // Email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your VidalSigns Lab Analysis Chat Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin-bottom: 10px;">VidalSigns</h1>
            <p style="color: #6b7280; font-size: 16px;">Your secure lab analysis link is ready!</p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #111827; margin-bottom: 15px;">🔬 Ready to Analyze Your Lab Results</h2>
            <p style="color: #374151; line-height: 1.6; margin-bottom: 25px;">
              We've created a secure chat session where you can upload and discuss your lab results. 
              Our AI will help you understand your results in plain English.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${chatLink}" 
                 style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                🚀 Start Your Lab Analysis
              </a>
            </div>
            
                         <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
               <strong>Link expires in 30 minutes</strong><br>
               For your security, this link will automatically expire after 30 minutes.
             </p>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
            <h3 style="color: #92400e; margin-bottom: 10px;">📋 What to Prepare</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Your lab report (PDF or image format)</li>
              <li>Any specific questions about your results</li>
              <li>Medical history context (optional)</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              This is an automated message from VidalSigns.<br>
              If you didn't request this link, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Chat link sent successfully',
      chatId: chatId,
      chatLink: chatLink
    });

  } catch (error) {
    console.error('Send chat link error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send chat link';
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Email authentication failed - check Gmail credentials';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Network error - check internet connection';
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