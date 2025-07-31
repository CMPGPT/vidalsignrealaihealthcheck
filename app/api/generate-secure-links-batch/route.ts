import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { QRCode } from '@/models/QRCode';
import { SecureLink } from '@/models/SecureLink';
import { PaymentHistory } from '@/models/PaymentHistory';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

// Create a schema for tracking processed transactions
const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  partnerId: { type: String, required: true },
  count: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: '30d' } // Auto-expire after 30 days
});

// Create or get the model
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { partnerId, count, transactionId = uuidv4(), packageName, amount } = await request.json();

    if (!partnerId || !count) {
      return NextResponse.json(
        { error: 'Partner ID and count are required' },
        { status: 400 }
      );
    }

    // Check if this transaction has already been processed
    const existingTransaction = await Transaction.findOne({ transactionId });
    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        count: existingTransaction.count,
        message: `Transaction already processed. ${existingTransaction.count} secure links were previously generated.`,
        alreadyProcessed: true
      });
    }

    // Save payment history if not already saved
    const existingPayment = await PaymentHistory.findOne({ transactionId });
    if (!existingPayment && packageName && amount) {
      await PaymentHistory.create({
        partnerId,
        transactionId,
        packageName,
        count,
        amount,
        currency: 'usd',
        status: 'completed',
        paymentMethod: 'card',
        paymentDate: new Date()
      });
    }

    // Generate the specified number of QR codes AND secure links for partner
    const qrCodes = [];
    const secureLinks = [];
    
    for (let i = 0; i < count; i++) {
      // Generate a unique QR code ID
      const qrCodeId = uuidv4();
      
      // Create the QR code (for partner's own use)
      const qrCode = new QRCode({
        id: qrCodeId,
        partnerId,
        assigned: true, // Partner assigns it to themselves
        customerName: 'Partner Owned',
        customerId: partnerId,
        assignedDate: new Date(),
        used: false,
        createdAt: new Date(),
        generated: new Date().toISOString(),
        metadata: {
          plan: packageName || 'Partner Package',
          description: `Partner QR Code ${i + 1}`,
          isActive: true,
          usageCount: 0,
          maxUsage: 1,
        }
      });
      
      // Create a secure link for this QR code
      const linkId = uuidv4();
      const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
      
      const secureLink = new SecureLink({
        linkId,
        partnerId,
        chatId,
        expiresAt: null, // No expiration
        isUsed: false,
        createdAt: new Date(),
        metadata: {
          qrCodeId: qrCodeId,
          partnerOwned: true,
          packageName: packageName
        }
      });
      
      qrCodes.push(qrCode);
      secureLinks.push(secureLink);
    }
    
    // Save all QR codes and secure links in bulk
    await QRCode.insertMany(qrCodes);
    await SecureLink.insertMany(secureLinks);
    
    // Record this transaction to prevent duplicate processing
    await Transaction.create({
      transactionId,
      partnerId,
      count
    });
    
    console.log(`Generated ${count} QR codes and secure links for partner ${partnerId}`);

    return NextResponse.json({
      success: true,
      count: qrCodes.length,
      message: `Generated ${qrCodes.length} QR codes and secure links successfully`
    });

  } catch (error) {
    console.error('Error generating secure links batch:', error);
    return NextResponse.json(
      { error: 'Failed to generate secure links batch' },
      { status: 500 }
    );
  }
} 