import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { PaymentHistory } from '@/models/PaymentHistory';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const partnerId = request.nextUrl.searchParams.get('partnerId');
    if (!partnerId) {
      return NextResponse.json({ error: 'partnerId is required' }, { status: 400 });
    }
    
    // Get payment history sorted by date (newest first)
    const rawPayments = await PaymentHistory.find({ partnerId })
      .sort({ paymentDate: -1 })
      .lean();

    // Map to frontend's expected shape
    const payments = rawPayments.map(payment => ({
      transactionId: payment.transactionId,
      planName: payment.packageName || '',
      quantity: payment.count || 0,
      totalAmount: payment.amount || 0,
      transactionDate: payment.paymentDate || payment.createdAt || new Date(),
      status: payment.status || 'completed',
      customerEmail: payment.customerEmail || '',
    }));

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }
} 