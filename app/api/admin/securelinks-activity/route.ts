import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET(req: NextRequest) {
  await dbConnect();
  // Get the last 6 months (including current)
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
      month: MONTHS[d.getMonth()],
      year: d.getFullYear(),
    });
  }

  // Aggregate by month
  const result = await SecureLink.aggregate([
    { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
    { $project: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
        isUsed: 1
      }
    },
    { $group: {
        _id: { month: "$month", year: "$year" },
        created: { $sum: 1 },
        used: { $sum: { $cond: ["$isUsed", 1, 0] } }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // Map results to month keys
  const data = months.map(({ key, month, year }, idx) => {
    const found = result.find(r => r._id.month === idx + now.getMonth() - 5 + 1 && r._id.year === year);
    return {
      month: key,
      created: found ? found.created : 0,
      used: found ? found.used : 0,
    };
  });

  return NextResponse.json({ data });
} 