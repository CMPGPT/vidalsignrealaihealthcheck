import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { PartnerTransaction } from '@/models/PartnerTransaction';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Sample data
    const sampleTransactions = [
      // Partner Purchases (Partner buying QR codes)
      {
        partnerId: "P-001",
        transactionType: "purchase",
        transactionId: "TXN-20241201-001",
        planName: "Basic QR Package",
        planPrice: 29.99,
        quantity: 10,
        totalAmount: 29.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-01"),
        metadata: {
          stripeSessionId: "cs_test_001",
          stripePaymentIntentId: "pi_test_001",
          notes: "Partner purchase: Basic QR Package - 10 QR codes"
        }
      },
      {
        partnerId: "P-001",
        transactionType: "purchase",
        transactionId: "TXN-20241205-002",
        planName: "Premium QR Package",
        planPrice: 49.99,
        quantity: 25,
        totalAmount: 49.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-05"),
        metadata: {
          stripeSessionId: "cs_test_002",
          stripePaymentIntentId: "pi_test_002",
          notes: "Partner purchase: Premium QR Package - 25 QR codes"
        }
      },
      {
        partnerId: "P-001",
        transactionType: "purchase",
        transactionId: "TXN-20241210-003",
        planName: "Enterprise QR Package",
        planPrice: 99.99,
        quantity: 50,
        totalAmount: 99.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-10"),
        metadata: {
          stripeSessionId: "cs_test_003",
          stripePaymentIntentId: "pi_test_003",
          notes: "Partner purchase: Enterprise QR Package - 50 QR codes"
        }
      },

      // Customer Sales (Customers buying from partner)
      {
        partnerId: "P-001",
        transactionType: "sale",
        transactionId: "TXN-20241202-004",
        customerEmail: "john.doe@example.com",
        customerName: "John Doe",
        planName: "Basic Plan",
        planPrice: 29.99,
        quantity: 5,
        totalAmount: 29.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-02"),
        metadata: {
          stripeSessionId: "cs_test_004",
          stripePaymentIntentId: "pi_test_004",
          secureLinkIds: ["link_001", "link_002", "link_003", "link_004", "link_005"],
          qrCodeIds: ["qr_001", "qr_002", "qr_003", "qr_004", "qr_005"],
          partnerWebsiteUrl: "https://partner1.example.com",
          customerIp: "192.168.1.100",
          customerLocation: "New York, NY",
          notes: "Customer purchase: Basic Plan - 5 QR codes"
        }
      },
      {
        partnerId: "P-001",
        transactionType: "sale",
        transactionId: "TXN-20241203-005",
        customerEmail: "jane.smith@example.com",
        customerName: "Jane Smith",
        planName: "Premium Plan",
        planPrice: 49.99,
        quantity: 10,
        totalAmount: 49.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-03"),
        metadata: {
          stripeSessionId: "cs_test_005",
          stripePaymentIntentId: "pi_test_005",
          secureLinkIds: ["link_006", "link_007", "link_008", "link_009", "link_010", "link_011", "link_012", "link_013", "link_014", "link_015"],
          qrCodeIds: ["qr_006", "qr_007", "qr_008", "qr_009", "qr_010", "qr_011", "qr_012", "qr_013", "qr_014", "qr_015"],
          partnerWebsiteUrl: "https://partner1.example.com",
          customerIp: "192.168.1.101",
          customerLocation: "Los Angeles, CA",
          notes: "Customer purchase: Premium Plan - 10 QR codes"
        }
      },
      {
        partnerId: "P-001",
        transactionType: "sale",
        transactionId: "TXN-20241204-006",
        customerEmail: "mike.wilson@example.com",
        customerName: "Mike Wilson",
        planName: "Basic Plan",
        planPrice: 29.99,
        quantity: 3,
        totalAmount: 29.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-04"),
        metadata: {
          stripeSessionId: "cs_test_006",
          stripePaymentIntentId: "pi_test_006",
          secureLinkIds: ["link_016", "link_017", "link_018"],
          qrCodeIds: ["qr_016", "qr_017", "qr_018"],
          partnerWebsiteUrl: "https://partner1.example.com",
          customerIp: "192.168.1.102",
          customerLocation: "Chicago, IL",
          notes: "Customer purchase: Basic Plan - 3 QR codes"
        }
      },
      {
        partnerId: "P-001",
        transactionType: "sale",
        transactionId: "TXN-20241206-007",
        customerEmail: "sarah.johnson@example.com",
        customerName: "Sarah Johnson",
        planName: "Enterprise Plan",
        planPrice: 99.99,
        quantity: 20,
        totalAmount: 99.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-06"),
        metadata: {
          stripeSessionId: "cs_test_007",
          stripePaymentIntentId: "pi_test_007",
          secureLinkIds: ["link_019", "link_020", "link_021", "link_022", "link_023", "link_024", "link_025", "link_026", "link_027", "link_028", "link_029", "link_030", "link_031", "link_032", "link_033", "link_034", "link_035", "link_036", "link_037", "link_038"],
          qrCodeIds: ["qr_019", "qr_020", "qr_021", "qr_022", "qr_023", "qr_024", "qr_025", "qr_026", "qr_027", "qr_028", "qr_029", "qr_030", "qr_031", "qr_032", "qr_033", "qr_034", "qr_035", "qr_036", "qr_037", "qr_038"],
          partnerWebsiteUrl: "https://partner1.example.com",
          customerIp: "192.168.1.103",
          customerLocation: "Miami, FL",
          notes: "Customer purchase: Enterprise Plan - 20 QR codes"
        }
      },
      {
        partnerId: "P-001",
        transactionType: "sale",
        transactionId: "TXN-20241207-008",
        customerEmail: "david.brown@example.com",
        customerName: "David Brown",
        planName: "Premium Plan",
        planPrice: 49.99,
        quantity: 8,
        totalAmount: 49.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-07"),
        metadata: {
          stripeSessionId: "cs_test_008",
          stripePaymentIntentId: "pi_test_008",
          secureLinkIds: ["link_039", "link_040", "link_041", "link_042", "link_043", "link_044", "link_045", "link_046"],
          qrCodeIds: ["qr_039", "qr_040", "qr_041", "qr_042", "qr_043", "qr_044", "qr_045", "qr_046"],
          partnerWebsiteUrl: "https://partner1.example.com",
          customerIp: "192.168.1.104",
          customerLocation: "Seattle, WA",
          notes: "Customer purchase: Premium Plan - 8 QR codes"
        }
      },
      {
        partnerId: "P-001",
        transactionType: "sale",
        transactionId: "TXN-20241208-009",
        customerEmail: "emma.davis@example.com",
        customerName: "Emma Davis",
        planName: "Basic Plan",
        planPrice: 29.99,
        quantity: 7,
        totalAmount: 29.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-08"),
        metadata: {
          stripeSessionId: "cs_test_009",
          stripePaymentIntentId: "pi_test_009",
          secureLinkIds: ["link_047", "link_048", "link_049", "link_050", "link_051", "link_052", "link_053"],
          qrCodeIds: ["qr_047", "qr_048", "qr_049", "qr_050", "qr_051", "qr_052", "qr_053"],
          partnerWebsiteUrl: "https://partner1.example.com",
          customerIp: "192.168.1.105",
          customerLocation: "Austin, TX",
          notes: "Customer purchase: Basic Plan - 7 QR codes"
        }
      },
      {
        partnerId: "P-001",
        transactionType: "sale",
        transactionId: "TXN-20241209-010",
        customerEmail: "alex.taylor@example.com",
        customerName: "Alex Taylor",
        planName: "Enterprise Plan",
        planPrice: 99.99,
        quantity: 15,
        totalAmount: 99.99,
        currency: "USD",
        paymentMethod: "stripe",
        status: "completed",
        transactionDate: new Date("2024-12-09"),
        metadata: {
          stripeSessionId: "cs_test_010",
          stripePaymentIntentId: "pi_test_010",
          secureLinkIds: ["link_054", "link_055", "link_056", "link_057", "link_058", "link_059", "link_060", "link_061", "link_062", "link_063", "link_064", "link_065", "link_066", "link_067", "link_068"],
          qrCodeIds: ["qr_054", "qr_055", "qr_056", "qr_057", "qr_058", "qr_059", "qr_060", "qr_061", "qr_062", "qr_063", "qr_064", "qr_065", "qr_066", "qr_067", "qr_068"],
          partnerWebsiteUrl: "https://partner1.example.com",
          customerIp: "192.168.1.106",
          customerLocation: "Denver, CO",
          notes: "Customer purchase: Enterprise Plan - 15 QR codes"
        }
      }
    ];

    // Clear existing sample data for this partner
    await PartnerTransaction.deleteMany({ partnerId: "P-001" });
    console.log('✅ Cleared existing sample data for P-001');

    // Insert sample transactions
    const result = await PartnerTransaction.insertMany(sampleTransactions);
    console.log(`✅ Inserted ${result.length} sample transactions`);

    // Calculate summary
    const sales = result.filter(t => t.transactionType === 'sale');
    const purchases = result.filter(t => t.transactionType === 'purchase');
    
    const totalRevenue = sales.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalSpent = purchases.reduce((sum, t) => sum + t.totalAmount, 0);
    const uniqueCustomers = new Set(sales.map(t => t.customerEmail)).size;

    return NextResponse.json({
      success: true,
      message: 'Sample data inserted successfully!',
      summary: {
        totalRevenue,
        totalSpent,
        netProfit: totalRevenue - totalSpent,
        totalSales: sales.length,
        totalPurchases: purchases.length,
        uniqueCustomers,
        transactionsInserted: result.length
      },
      transactions: result.map(t => ({
        id: t.transactionId,
        type: t.transactionType,
        date: t.transactionDate,
        amount: t.totalAmount,
        customer: t.customerEmail,
        plan: t.planName,
        quantity: t.quantity
      }))
    });

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
    return NextResponse.json(
      { error: 'Failed to insert sample data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 