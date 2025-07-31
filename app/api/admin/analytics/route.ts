import { NextRequest, NextResponse } from 'next/server';
import { QRCode } from '@/models/QRCode';
import PartnerUser from '@/models/PartnerUser';
import { SecureLink } from '@/models/SecureLink';
import { PaymentHistory } from '@/models/PaymentHistory';
import { PartnerTransaction } from '@/models/PartnerTransaction';
import { Report } from '@/models/Report';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';

    // Get QR Code Analytics from database
    const qrCodeStats = await QRCode.aggregate([
      {
        $group: {
          _id: null,
          totalQRCodes: { $sum: 1 },
          totalRedeemed: { $sum: { $cond: [{ $eq: ['$redeemed', true] }, 1, 0] } },
          totalScanned: { $sum: { $cond: [{ $eq: ['$scanned', true] }, 1, 0] } },
          totalAssigned: { $sum: { $cond: [{ $eq: ['$assigned', true] }, 1, 0] } }
        }
      }
    ]);

    // Get Daily Analytics (Last 7 days) from database
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyData = await QRCode.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          redeemed: { $sum: { $cond: [{ $eq: ['$redeemed', true] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days with zero data
    const dailyDataMap = new Map();
    dailyData.forEach(item => {
      dailyDataMap.set(item._id, item);
    });

    const completeDailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const existingData = dailyDataMap.get(dateStr);
      completeDailyData.push({
        name: dayName,
        redeemed: existingData ? existingData.redeemed : 0,
        total: existingData ? existingData.total : 0,
        date: dateStr
      });
    }

    // Get Monthly Analytics (Last 12 months) from database
    const monthlyData = await QRCode.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          redeemed: { $sum: { $cond: [{ $eq: ['$redeemed', true] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Fill in missing months with zero data
    const monthlyDataMap = new Map();
    monthlyData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      monthlyDataMap.set(key, item);
    });

    const completeMonthlyData = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      const existingData = monthlyDataMap.get(key);
      completeMonthlyData.push({
        name: monthName,
        redeemed: existingData ? existingData.redeemed : 0,
        total: existingData ? existingData.total : 0,
        month: date.getMonth() + 1,
        year: date.getFullYear()
      });
    }

    // Get Partner Analytics from database
    const partnerData = await QRCode.aggregate([
      {
        $lookup: {
          from: 'partnerusers',
          localField: 'partnerId',
          foreignField: 'unique_id',
          as: 'partner'
        }
      },
      {
        $unwind: '$partner'
      },
      {
        $group: {
          _id: '$partnerId',
          name: { $first: '$partner.organization_name' },
          qrCodes: { $sum: 1 },
          redemptions: { $sum: { $cond: [{ $eq: ['$redeemed', true] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          redemptionRate: {
            $multiply: [
              { $divide: ['$redemptions', '$qrCodes'] },
              100
            ]
          }
        }
      },
      { $sort: { redemptions: -1 } },
      { $limit: 10 }
    ]);

    // Format partner data for charts
    const formattedPartnerData = partnerData.length > 0 ? partnerData.map(item => ({
      partnerId: item._id,
      name: item.name || 'Unknown Partner',
      qrCodes: item.qrCodes,
      redemptions: item.redemptions,
      redemptionRate: Math.round(item.redemptionRate)
    })) : [
      {
        partnerId: 'no-data',
        name: 'No Partners',
        qrCodes: 0,
        redemptions: 0,
        redemptionRate: 0
      }
    ];

    // Get Revenue Analytics from database
    const revenueData = await PaymentHistory.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      }
    ]);

    // Get Partner Performance Analytics from database
    const partnerPerformance = await PartnerTransaction.aggregate([
      { $match: { transactionType: 'sale' } },
      {
        $group: {
          _id: '$partnerId',
          totalSales: { $sum: '$totalAmount' },
          transactionCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 }
    ]);

    // Format partner performance data
    const formattedPartnerPerformance = partnerPerformance.length > 0 ? partnerPerformance.map(item => ({
      partnerId: item._id,
      totalSales: item.totalSales,
      transactionCount: item.transactionCount,
      averageOrderValue: Math.round(item.averageOrderValue * 100) / 100
    })) : [
      {
        partnerId: 'no-data',
        totalSales: 0,
        transactionCount: 0,
        averageOrderValue: 0
      }
    ];

    const analyticsData = {
      daily: completeDailyData,
      monthly: completeMonthlyData,
      partners: formattedPartnerData,
      partnerPerformance: formattedPartnerPerformance
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 