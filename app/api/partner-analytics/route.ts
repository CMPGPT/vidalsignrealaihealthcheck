import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { PartnerTransaction } from '@/models/PartnerTransaction';
import { SecureLink } from '@/models/SecureLink';
import { QRCode } from '@/models/QRCode';
import { Report } from '@/models/Report';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const timeRange = searchParams.get('timeRange') || 'last30days';
    
    if (!partnerId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Partner ID is required' 
      }, { status: 400 });
    }

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get previous period for comparison
    const periodDuration = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);

    // 1. Revenue Analytics
    // Get all sales (to customers)
    const currentPeriodSales = await PartnerTransaction.find({
      partnerId,
      transactionType: 'sale',
      transactionDate: { $gte: startDate, $lte: now },
      status: 'completed'
    });
    const previousPeriodSales = await PartnerTransaction.find({
      partnerId,
      transactionType: 'sale',
      transactionDate: { $gte: previousStartDate, $lt: startDate },
      status: 'completed'
    });
    const currentRevenue = currentPeriodSales.reduce((sum, t) => sum + t.totalAmount, 0);
    const previousRevenue = previousPeriodSales.reduce((sum, t) => sum + t.totalAmount, 0);
    // Get all QR code purchases (by partner)
    // Try PartnerTransaction first, fallback to PaymentHistory if needed
    const currentPeriodPurchases = await PartnerTransaction.find({
      partnerId,
      transactionType: 'purchase',
      transactionDate: { $gte: startDate, $lte: now },
      status: 'completed'
    });
    const totalSpent = currentPeriodPurchases.reduce((sum, t) => sum + t.totalAmount, 0);
    // Net revenue = sales - spent
    const netRevenue = currentRevenue - totalSpent;
    const revenueGrowth = previousRevenue > 0 ? ((netRevenue - (previousRevenue)) / previousRevenue) * 100 : 0;

    // 2. QR Code Analytics
    const qrCodes = await QRCode.find({ partnerId });
    const totalQRCodes = qrCodes.length;
    const usedQRCodes = qrCodes.filter(qr => qr.used || qr.scanned || qr.redeemed).length;
    const availableQRCodes = totalQRCodes - usedQRCodes;

    // 3. Secure Link Analytics
    const secureLinks = await SecureLink.find({ partnerId });
    const totalSecureLinks = secureLinks.length;
    const usedSecureLinks = secureLinks.filter(link => link.isUsed).length;
    const activeSecureLinks = secureLinks.filter(link => !link.isUsed && link.expiresAt > now).length;

    // 4. Customer Analytics
    const uniqueCustomers = new Set(currentPeriodSales.map((t: any) => t.customerEmail)).size;
    const previousUniqueCustomers = new Set(previousPeriodSales.map((t: any) => t.customerEmail)).size;
    const customerGrowth = previousUniqueCustomers > 0 ? ((uniqueCustomers - previousUniqueCustomers) / previousUniqueCustomers) * 100 : 0;

    // 5. Monthly Trends (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const monthlyTransactions = await PartnerTransaction.aggregate([
      {
        $match: {
          partnerId,
          transactionType: 'sale',
          transactionDate: { $gte: sixMonthsAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' }
          },
          revenue: { $sum: '$totalAmount' },
          transactions: { $sum: 1 },
          customers: { $addToSet: '$customerEmail' }
        }
      },
      {
        $project: {
          _id: 0,
          month: { $concat: [{ $toString: '$_id.year' }, '-', { $toString: '$_id.month' }] },
          revenue: 1,
          transactions: 1,
          customers: { $size: '$customers' }
        }
      },
      { $sort: { month: 1 } }
    ]);

    // 6. Daily Activity (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyTransactions = await PartnerTransaction.aggregate([
      {
        $match: {
          partnerId,
          transactionType: 'sale',
          transactionDate: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' },
            day: { $dayOfMonth: '$transactionDate' }
          },
          revenue: { $sum: '$totalAmount' },
          transactions: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: { $dateToString: { format: '%Y-%m-%d', date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' } } } },
          revenue: 1,
          transactions: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // 7. Top Performing Plans
    const planPerformance = await PartnerTransaction.aggregate([
      {
        $match: {
          partnerId,
          transactionType: 'sale',
          transactionDate: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$planName',
          totalRevenue: { $sum: '$totalAmount' },
          totalSales: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          avgPrice: { $avg: '$planPrice' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // 8. Customer Insights
    const customerInsights = await PartnerTransaction.aggregate([
      {
        $match: {
          partnerId,
          transactionType: 'sale',
          transactionDate: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$customerEmail',
          totalSpent: { $sum: '$totalAmount' },
          totalPurchases: { $sum: 1 },
          lastPurchase: { $max: '$transactionDate' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // 9. QR Code Usage Analytics
    const qrUsageAnalytics = await QRCode.aggregate([
      {
        $match: { partnerId }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalCreated: { $sum: 1 },
          totalUsed: { $sum: { $cond: [{ $or: ['$used', '$scanned', '$redeemed'] }, 1, 0] } },
          totalScanned: { $sum: { $cond: ['$scanned', 1, 0] } },
          totalRedeemed: { $sum: { $cond: ['$redeemed', 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          month: { $concat: [{ $toString: '$_id.year' }, '-', { $toString: '$_id.month' }] },
          totalCreated: 1,
          totalUsed: 1,
          totalScanned: 1,
          totalRedeemed: 1,
          usageRate: { $multiply: [{ $divide: ['$totalUsed', '$totalCreated'] }, 100] }
        }
      },
      { $sort: { month: 1 } }
    ]);

    const analyticsData = {
      overview: {
        revenue: {
          current: netRevenue,
          previous: previousRevenue,
          growth: revenueGrowth,
          currency: 'USD',
          sales: currentRevenue,
          spent: totalSpent
        },
        transactions: {
          current: currentPeriodSales.length,
          previous: previousPeriodSales.length,
          growth: previousPeriodSales.length > 0 ? 
            ((currentPeriodSales.length - previousPeriodSales.length) / previousPeriodSales.length) * 100 : 0
        },
        customers: {
          current: uniqueCustomers,
          previous: previousUniqueCustomers,
          growth: customerGrowth
        },
        qrCodes: {
          total: totalQRCodes,
          used: usedQRCodes,
          available: availableQRCodes,
          usageRate: totalQRCodes > 0 ? (usedQRCodes / totalQRCodes) * 100 : 0
        },
        secureLinks: {
          total: totalSecureLinks,
          used: usedSecureLinks,
          active: activeSecureLinks,
          usageRate: totalSecureLinks > 0 ? (usedSecureLinks / totalSecureLinks) * 100 : 0
        }
      },
      trends: {
        monthly: monthlyTransactions,
        daily: dailyTransactions,
        qrUsage: qrUsageAnalytics
      },
      performance: {
        topPlans: planPerformance,
        customerInsights: customerInsights
      },
      timeRange: {
        current: {
          start: startDate.toISOString(),
          end: now.toISOString()
        },
        previous: {
          start: previousStartDate.toISOString(),
          end: startDate.toISOString()
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('❌ ANALYTICS: Error fetching analytics:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch analytics data' 
    }, { status: 500 });
  }
} 