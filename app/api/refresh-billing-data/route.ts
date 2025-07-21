import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { PartnerTransaction } from '@/models/PartnerTransaction';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const partnerId = request.nextUrl.searchParams.get('partnerId');
    
    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    console.log('🔍 REFRESH BILLING: Refreshing billing data for partnerId:', partnerId);

    // Get all transactions for the partner
    const transactions = await PartnerTransaction.find({
      partnerId
    }).sort({ transactionDate: -1 });

    console.log('🔍 REFRESH BILLING: Found transactions:', transactions.length);
    
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

    console.log('🔍 REFRESH BILLING: Statistics:', {
      totalRevenue,
      totalSpent,
      totalSales,
      totalPurchases,
      totalCustomers
    });

    // Format transactions for display
    const formattedTransactions = transactions
      .slice(0, 20)
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

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          totalRevenue,
          totalSales,
          totalCustomers,
          totalPurchases,
          totalSpent,
          netRevenue: totalRevenue - totalSpent
        },
        transactions: formattedTransactions
      },
      message: 'Billing data refreshed successfully'
    });

  } catch (error) {
    console.error('❌ REFRESH BILLING: Error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh billing data' },
      { status: 500 }
    );
  }
} 