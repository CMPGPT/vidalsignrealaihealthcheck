import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, organization, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'textgpt.team@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'nmangtukuuziqmiv',
      },
    });

    // Email content with proper formatting
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #e6f3ff;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 12px 12px 0 0;
            padding: 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: #14b8a6;
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header-icon {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 50%;
            margin-bottom: 20px;
            font-size: 24px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: white;
        }
        .content {
            padding: 40px 30px;
            background: white;
        }
        .invitation-message {
            text-align: center;
            color: #6b7280;
            margin-bottom: 30px;
            font-size: 16px;
        }
        .cta-button {
            display: inline-block;
            background: #0d9488;
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
        }
        .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 30px 0;
        }
        .section-title {
            color: #6b7280;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .field-group {
            margin-bottom: 25px;
        }
        .field-label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            display: block;
            font-size: 14px;
        }
        .field-value {
            background: #f9fafb;
            padding: 12px 16px;
            border-radius: 6px;
            border-left: 4px solid #14b8a6;
            color: #111827;
            font-size: 16px;
        }
        .message-box {
            background: #f9fafb;
            padding: 16px;
            border-radius: 6px;
            border-left: 4px solid #059669;
            color: #111827;
            font-size: 16px;
            line-height: 1.6;
            white-space: pre-wrap;
        }
        .footer {
            text-align: center;
            padding: 20px 30px;
            background: #f9fafb;
            color: #6b7280;
            font-size: 12px;
        }
        .footer-link {
            color: #14b8a6;
            text-decoration: underline;
        }
        .contact-summary {
            background: #f0fdf4;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            border: 1px solid #bbf7d0;
        }
        .contact-summary h3 {
            color: #166534;
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .contact-summary p {
            color: #166534;
            margin: 5px 0;
            font-size: 14px;
        }
        .highlight {
            color: #14b8a6;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-icon">📧</div>
            <h1>New Contact Form Submission</h1>
        </div>
        
        <div class="content">
            <div class="invitation-message">
                ${name} has submitted a contact form through VidalSigns Medical Platform.
            </div>
            
            <div class="field-group">
                <span class="field-label">Name</span>
                <div class="field-value">${name}</div>
            </div>
            
            <div class="field-group">
                <span class="field-label">Email Address</span>
                <div class="field-value">${email}</div>
            </div>
            
            ${organization ? `
            <div class="field-group">
                <span class="field-label">Organization</span>
                <div class="field-value">${organization}</div>
            </div>
            ` : ''}
            
            <div class="field-group">
                <span class="field-label">Message</span>
                <div class="message-box">${message}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="section-title">Contact Information Summary</div>
            
            <div class="contact-summary">
                <h3>📞 Contact Details</h3>
                <p><span class="highlight">Name:</span> ${name}</p>
                <p><span class="highlight">Email:</span> ${email}</p>
                ${organization ? `<p><span class="highlight">Organization:</span> ${organization}</p>` : ''}
                <p><span class="highlight">Message Length:</span> ${message.length} characters</p>
                <p><span class="highlight">Submitted:</span> ${new Date().toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                })}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>This message was sent from the VidalSigns contact form.</p>
            <p>You can reply directly to this email to respond to the sender.</p>
            <p style="margin-top: 10px;">
                <span class="highlight">VidalSigns Medical Platform</span> - Making Medical Reports Simple
            </p>
        </div>
    </div>
</body>
</html>
    `;

    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER || 'textgpt.team@gmail.com',
      to: 'textgpt.team@gmail.com',
      subject: `📧 New Contact Form Submission from ${name}`,
      html: emailContent,
      replyTo: email, // This allows you to reply directly to the sender
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send contact form' },
      { status: 500 }
    );
  }
} 