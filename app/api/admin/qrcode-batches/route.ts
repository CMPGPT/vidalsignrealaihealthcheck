import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { QRCode } from '@/models/QRCode';

export async function GET(req: NextRequest) {
  await dbConnect();
  // Group QR codes by batchId, count total and used, and get createdAt and status
  const batches = await QRCode.aggregate([
    {
      $group: {
        _id: "$batchId",
        total: { $sum: 1 },
        used: { $sum: { $cond: ["$used", 1, 0] } },
        partnerId: { $first: "$partnerId" },
        createdAt: { $first: "$createdAt" },
        status: { $first: "$assigned" },
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  // Format for frontend
  const data = batches.map(b => ({
    id: b._id,
    partnerId: b.partnerId,
    created: b.createdAt,
    total: b.total,
    used: b.used,
    status: b.status ? 'active' : 'pending',
  }));

  return NextResponse.json({ batches: data });
} 