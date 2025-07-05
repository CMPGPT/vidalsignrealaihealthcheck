import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
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
      const secureLink = new SecureLink({
        linkId,
        partnerId,
        chatId,
        expiresAt,
        isUsed: false,
        createdAt: new Date()
      });
      
      secureLinks.push(secureLink);
    }
    
    // Save all secure links in bulk
    await SecureLink.insertMany(secureLinks);
    
    // Record this transaction to prevent duplicate processing
    await Transaction.create({
      transactionId,
      partnerId,
      count
    });
    
    console.log(`Generated ${count} secure links for partner ${partnerId}`);

    return NextResponse.json({
      success: true,
      count: secureLinks.length,
      message: `Generated ${secureLinks.length} secure links successfully`
    });

  } catch (error) {
    console.error('Error generating secure links batch:', error);
    return NextResponse.json(
      { error: 'Failed to generate secure links batch' },
      { status: 500 }
    );
  }
} 