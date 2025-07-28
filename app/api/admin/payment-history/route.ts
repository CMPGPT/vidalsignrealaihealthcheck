import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { PaymentHistory } from '@/models/PaymentHistory';

export async function GET(req: NextRequest) {
  await dbConnect();
  const payments = await PaymentHistory.find({}).sort({ paymentDate: -1 }).lean();
  return NextResponse.json({ payments });
} 