import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { PartnerTransaction } from '@/models/PartnerTransaction';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const partnerId = request.nextUrl.searchParams.get('partnerId');
    const period = request.nextUrl.searchParams.get('period') || 'all'; // all, month, year
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    console.log('🔍 BILLING HISTORY: Fetching billing history for partnerId:', partnerId);
    console.log('🔍 BILLING HISTORY: Period:', period);

    // Calculate date filters
    const now = new Date();
    let startDate: Date | null = null;
    
    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // Build date filter
    const dateFilter = startDate ? { 
      transactionDate: { $gte: startDate } 
    } : {};

    // Get all transactions for the partner
    const transactions = await PartnerTransaction.find({
      partnerId,
      ...dateFilter
    }).sort({ transactionDate: -1 });

    console.log('🔍 BILLING HISTORY: Found transactions:', transactions.length);
    
    // Debug: Log the first few transactions
    transactions.slice(0, 5).forEach((tx, i) => {
      console.log(`Transaction ${i + 1}:`, {
        id: tx.transactionId,
        type: tx.transactionType,
        amount: tx.totalAmount,
        planName: tx.planName,
        date: tx.transactionDate
      });
    });

    // Calculate statistics
    const sales = transactions.filter(t => t.transactionType === 'sale');
    const purchases = transactions.filter(t => t.transactionType === 'purchase');
    
    const totalRevenue = sales.reduce((sum, transaction) => sum + transaction.totalAmount, 0);
    const totalSpent = purchases.reduce((sum, transaction) => sum + transaction.totalAmount, 0);
    const totalSales = sales.length;
    const totalPurchases = purchases.length;
    const totalCustomers = new Set(sales.map(t => t.customerEmail)).size;

    console.log('🔍 BILLING HISTORY: Statistics:', {
      totalRevenue,
      totalSpent,
      totalSales,
      totalPurchases,
      totalCustomers
    });

    // Get monthly/yearly breakdown
    const monthlyStats = await PartnerTransaction.aggregate([
      {
        $match: {
          partnerId,
          transactionType: 'sale',
          ...dateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    ]);

    // Format transactions for display
    const formattedTransactions = transactions
      .slice((page - 1) * limit, page * limit)
      .map(transaction => ({
        id: transaction.transactionId,
        date: transaction.transactionDate,
        type: transaction.transactionType,
        customerEmail: transaction.customerEmail,
        planName: transaction.planName,
        quantity: transaction.quantity,
        amount: transaction.totalAmount,
        status: transaction.status,
        currency: transaction.currency
      }));

    // Calculate pagination
    const totalTransactions = transactions.length;
    const totalPages = Math.ceil(totalTransactions / limit);

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          totalRevenue,
          totalSales,
          totalCustomers,
          totalPurchases,
          totalSpent
        },
        monthlyStats,
        transactions: formattedTransactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalTransactions,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ PARTNER BILLING HISTORY: Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    );
  }
} 