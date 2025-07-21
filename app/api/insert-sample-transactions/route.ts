import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { PartnerTransaction } from '@/models/PartnerTransaction';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Use the correct partner ID (MongoDB _id) from the logged-in user
    const partnerId = "686aa71d7848ed9baed37c7f";
    
    // Clear existing sample transactions for this partner (keep the real ones)
    await PartnerTransaction.deleteMany({ 
      partnerId,
      transactionId: { $regex: /^SAMPLE-/ }
    });
    
    // Insert sample transactions with different dates
    const sampleTransactions = [];
    const now = new Date();
    
    // Create sample transactions over the last 3 months
    const plans = [
      { name: "Basic Plan", price: 19.99, quantity: 5 },
      { name: "Premium Plan", price: 49.99, quantity: 10 },
      { name: "Enterprise Plan", price: 99.99, quantity: 20 },
      { name: "Starter Pack", price: 29.99, quantity: 8 },
      { name: "Professional Pack", price: 79.99, quantity: 15 }
    ];
    
    const customers = [
      "john.doe@example.com",
      "jane.smith@example.com", 
      "bob.wilson@example.com",
      "alice.brown@example.com",
      "charlie.davis@example.com",
      "diana.miller@example.com",
      "edward.garcia@example.com",
      "fiona.rodriguez@example.com"
    ];
    
    // Create 20 sample transactions over the last 3 months
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.random() * 90; // Random date in last 90 days
      const transactionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      
      const transaction = {
        partnerId,
        transactionType: 'sale',
        transactionId: `SAMPLE-${Date.now()}-${i}`,
        customerEmail: customer,
        customerName: customer.split('@')[0].replace('.', ' '),
        planName: plan.name,
        planPrice: plan.price,
        quantity: plan.quantity,
        totalAmount: plan.price * plan.quantity,
        currency: 'USD',
        paymentMethod: 'stripe',
        status: 'completed',
        transactionDate,
        metadata: {
          stripeSessionId: `sess_sample_${i}`,
          stripePaymentIntentId: `pi_sample_${i}`,
          secureLinkIds: [`link_${i}_1`, `link_${i}_2`],
          qrCodeIds: [`qr_${i}_1`, `qr_${i}_2`, `qr_${i}_3`],
          partnerWebsiteUrl: 'https://example-partner.com',
          customerIp: `192.168.1.${i}`,
          customerLocation: 'United States',
          notes: `Sample transaction ${i}`
        }
      };
      
      sampleTransactions.push(transaction);
    }
    
    await PartnerTransaction.insertMany(sampleTransactions);
    
    return NextResponse.json({
      success: true,
      message: 'Sample transactions inserted successfully for correct partner ID',
      data: {
        partnerId,
        transactionsInserted: sampleTransactions.length
      }
    });
    
  } catch (error) {
    console.error('❌ SAMPLE TRANSACTIONS: Error inserting sample transactions:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to insert sample transactions' 
    }, { status: 500 });
  }
} 