import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { PartnerTransaction } from '@/models/PartnerTransaction';
import { QRCode } from '@/models/QRCode';
import { SecureLink } from '@/models/SecureLink';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get all partner users
    const partnerUsers = await PartnerUser.find({}, { 
      unique_id: 1, 
      email: 1, 
      first_Name: 1, 
      last_Name: 1,
      organization_name: 1 
    });
    
    // Get transaction counts for each partner
    const transactionCounts = await PartnerTransaction.aggregate([
      {
        $group: {
          _id: '$partnerId',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Debug: Log all transactions for the first partner
    if (partnerUsers.length > 0) {
      const firstPartnerId = (partnerUsers[0] as any)._id.toString();
      console.log('🔍 DEBUG: Fetching transactions for first partner:', firstPartnerId);
      
      const partnerTransactions = await PartnerTransaction.find({ partnerId: firstPartnerId })
        .sort({ transactionDate: -1 })
        .limit(10);
      
      console.log('🔍 DEBUG: Recent transactions for partner:', firstPartnerId);
      partnerTransactions.forEach((tx, i) => {
        console.log(`Transaction ${i + 1}:`, {
          id: tx.transactionId,
          type: tx.transactionType,
          amount: tx.totalAmount,
          planName: tx.planName,
          date: tx.transactionDate
        });
      });
      
      // Calculate totals
      const sales = partnerTransactions.filter(t => t.transactionType === 'sale');
      const purchases = partnerTransactions.filter(t => t.transactionType === 'purchase');
      const totalRevenue = sales.reduce((sum: number, t: any) => sum + (t.totalAmount || 0), 0);
      const totalSpent = purchases.reduce((sum: number, t: any) => sum + (t.totalAmount || 0), 0);
      
      console.log('🔍 DEBUG: Transaction summary:', {
        totalTransactions: partnerTransactions.length,
        sales: sales.length,
        purchases: purchases.length,
        totalRevenue,
        totalSpent,
        netRevenue: totalRevenue - totalSpent
      });
    }
    
    // Get QR code counts for each partner
    const qrCodeCounts = await QRCode.aggregate([
      {
        $group: {
          _id: '$partnerId',
          count: { $sum: 1 },
          used: { $sum: { $cond: [{ $or: ['$used', '$scanned', '$redeemed'] }, 1, 0] } }
        }
      }
    ]);
    
    // Get secure link counts for each partner
    const secureLinkCounts = await SecureLink.aggregate([
      {
        $group: {
          _id: '$partnerId',
          count: { $sum: 1 },
          used: { $sum: { $cond: ['$isUsed', 1, 0] } }
        }
      }
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        partnerUsers: partnerUsers.map(user => ({
          unique_id: user.unique_id,
          email: user.email,
          name: `${user.first_Name} ${user.last_Name}`,
          organization: user.organization_name
        })),
        transactionCounts,
        qrCodeCounts,
        secureLinkCounts
      }
    });
    
  } catch (error) {
    console.error('❌ DEBUG: Error fetching partner users:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch partner users' 
    }, { status: 500 });
  }
} 