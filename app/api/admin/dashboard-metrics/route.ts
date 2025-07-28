import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';
import PartnerUser from '@/models/PartnerUser';
import { PaymentHistory } from '@/models/PaymentHistory';

export async function GET(req: NextRequest) {
  await dbConnect();

  // Total QR Codes
  const totalQrCodes = await SecureLink.countDocuments();
  // QR Redemptions
  const qrRedemptions = await SecureLink.countDocuments({ isUsed: true });
  // Active Partners
  const activePartners = await PartnerUser.countDocuments();
  // Revenue
  const revenueAgg = await PaymentHistory.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

  return NextResponse.json({
    totalQrCodes,
    qrRedemptions,
    activePartners,
    revenue
  });
} 