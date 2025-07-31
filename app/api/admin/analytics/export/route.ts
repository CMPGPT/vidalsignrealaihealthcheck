import { NextRequest, NextResponse } from 'next/server';
import { QRCode } from '@/models/QRCode';
import PartnerUser from '@/models/PartnerUser';
import { PaymentHistory } from '@/models/PaymentHistory';
import { PartnerTransaction } from '@/models/PartnerTransaction';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const period = searchParams.get('period') || 'all';

    // Get comprehensive analytics data from database
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

    const dailyData = await QRCode.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          redeemed: { $sum: { $cond: [{ $eq: ['$redeemed', true] }, 1, 0] } },
          total: { $sum: 1 },
          scanned: { $sum: { $cond: [{ $eq: ['$scanned', true] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

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
          partnerName: { $first: '$partner.organization_name' },
          partnerEmail: { $first: '$partner.email' },
          qrCodes: { $sum: 1 },
          redemptions: { $sum: { $cond: [{ $eq: ['$redeemed', true] }, 1, 0] } },
          scanned: { $sum: { $cond: [{ $eq: ['$scanned', true] }, 1, 0] } }
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
      { $sort: { redemptions: -1 } }
    ]);

    const revenueData = await PaymentHistory.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paymentDate" }
          },
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageTransaction: { $avg: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const partnerTransactions = await PartnerTransaction.aggregate([
      { $match: { transactionType: 'sale' } },
      {
        $group: {
          _id: '$partnerId',
          totalSales: { $sum: '$totalAmount' },
          transactionCount: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // Prepare export data
    const exportData = {
      summary: {
        period,
        totalQRCodes: qrCodeStats[0]?.totalQRCodes || 0,
        totalRedeemed: qrCodeStats[0]?.totalRedeemed || 0,
        totalScanned: qrCodeStats[0]?.totalScanned || 0,
        redemptionRate: qrCodeStats[0]?.totalQRCodes > 0
          ? Math.round((qrCodeStats[0].totalRedeemed / qrCodeStats[0].totalQRCodes) * 100)
          : 0
      },
      dailyStats: dailyData.map(item => ({
        date: item._id,
        redeemed: item.redeemed,
        total: item.total,
        scanned: item.scanned,
        redemptionRate: item.total > 0 ? Math.round((item.redeemed / item.total) * 100) : 0
      })),
      partnerStats: partnerData.map(item => ({
        partnerId: item._id,
        partnerName: item.partnerName || 'Unknown',
        partnerEmail: item.partnerEmail || '',
        qrCodes: item.qrCodes,
        redemptions: item.redemptions,
        scanned: item.scanned,
        redemptionRate: Math.round(item.redemptionRate)
      })),
      revenueStats: revenueData.map(item => ({
        date: item._id,
        totalRevenue: item.totalRevenue,
        transactionCount: item.transactionCount,
        averageTransaction: Math.round(item.averageTransaction * 100) / 100
      })),
      partnerTransactions: partnerTransactions.map(item => ({
        partnerId: item._id,
        totalSales: item.totalSales,
        transactionCount: item.transactionCount,
        averageOrderValue: Math.round(item.averageOrderValue * 100) / 100,
        totalQuantity: item.totalQuantity
      }))
    };

    if (format === 'csv') {
      // Generate CSV format
      const csvData = generateCSV(exportData);

      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-export-${period}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: exportData,
      format,
      period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics Export Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateCSV(data: any): string {
  const csvRows = [];

  // Summary section
  csvRows.push('SUMMARY');
  csvRows.push('Period,Total QR Codes,Total Redeemed,Total Scanned,Redemption Rate (%)');
  csvRows.push(`${data.summary.period},${data.summary.totalQRCodes},${data.summary.totalRedeemed},${data.summary.totalScanned},${data.summary.redemptionRate}`);
  csvRows.push('');

  // Daily stats section
  csvRows.push('DAILY STATISTICS');
  csvRows.push('Date,Redeemed,Total,Scanned,Redemption Rate (%)');
  data.dailyStats.forEach((row: any) => {
    csvRows.push(`${row.date},${row.redeemed},${row.total},${row.scanned},${row.redemptionRate}`);
  });
  csvRows.push('');

  // Partner stats section
  csvRows.push('PARTNER STATISTICS');
  csvRows.push('Partner ID,Partner Name,Partner Email,QR Codes,Redemptions,Scanned,Redemption Rate (%)');
  data.partnerStats.forEach((row: any) => {
    csvRows.push(`${row.partnerId},${row.partnerName},${row.partnerEmail},${row.qrCodes},${row.redemptions},${row.scanned},${row.redemptionRate}`);
  });
  csvRows.push('');

  // Revenue stats section
  csvRows.push('REVENUE STATISTICS');
  csvRows.push('Date,Total Revenue,Transaction Count,Average Transaction');
  data.revenueStats.forEach((row: any) => {
    csvRows.push(`${row.date},${row.totalRevenue},${row.transactionCount},${row.averageTransaction}`);
  });
  csvRows.push('');

  // Partner transactions section
  csvRows.push('PARTNER TRANSACTIONS');
  csvRows.push('Partner ID,Total Sales,Transaction Count,Average Order Value,Total Quantity');
  data.partnerTransactions.forEach((row: any) => {
    csvRows.push(`${row.partnerId},${row.totalSales},${row.transactionCount},${row.averageOrderValue},${row.totalQuantity}`);
  });

  return csvRows.join('\n');
} 