const mongoose = require('mongoose');

// PartnerTransaction Schema (same as the model)
const PartnerTransactionSchema = new mongoose.Schema({
  partnerId: {
    type: String,
    required: true,
    index: true
  },
  transactionType: {
    type: String,
    enum: ['sale', 'purchase'],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  customerEmail: {
    type: String,
    required: function() {
      return this.transactionType === 'sale';
    }
  },
  customerName: {
    type: String
  },
  planName: {
    type: String,
    required: true
  },
  planPrice: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    default: 'stripe'
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed', 'refunded'],
    default: 'completed'
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  metadata: {
    stripeSessionId: String,
    stripePaymentIntentId: String,
    secureLinkIds: [String],
    qrCodeIds: [String],
    partnerWebsiteUrl: String,
    customerIp: String,
    customerLocation: String,
    notes: String
  }
}, {
  timestamps: true
});

const PartnerTransaction = mongoose.model('PartnerTransaction', PartnerTransactionSchema);

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

async function insertSampleData() {
  try {
    console.log('🚀 Starting sample data insertion...');
    
    // Get MongoDB URI from environment or use default
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vidalsignrealaihealthcheck';
    console.log('🔗 Connecting to MongoDB:', mongoUri);
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing sample data for this partner
    console.log('🧹 Clearing existing sample data for P-001...');
    await PartnerTransaction.deleteMany({ partnerId: "P-001" });
    console.log('✅ Cleared existing sample data for P-001');

    // Insert sample transactions
    console.log('📝 Inserting sample transactions...');
    const result = await PartnerTransaction.insertMany(sampleTransactions);
    console.log(`✅ Inserted ${result.length} sample transactions`);

    // Display summary
    const sales = result.filter(t => t.transactionType === 'sale');
    const purchases = result.filter(t => t.transactionType === 'purchase');
    
    const totalRevenue = sales.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalSpent = purchases.reduce((sum, t) => sum + t.totalAmount, 0);
    const uniqueCustomers = new Set(sales.map(t => t.customerEmail)).size;

    console.log('\n📊 Sample Data Summary:');
    console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`💸 Total Spent: $${totalSpent.toFixed(2)}`);
    console.log(`📈 Net Profit: $${(totalRevenue - totalSpent).toFixed(2)}`);
    console.log(`🛒 Total Sales: ${sales.length}`);
    console.log(`👥 Unique Customers: ${uniqueCustomers}`);
    console.log(`📦 Total Purchases: ${purchases.length}`);

    console.log('\n📅 Transaction Dates:');
    result.forEach(t => {
      const date = t.transactionDate.toLocaleDateString();
      const type = t.transactionType === 'sale' ? '💰 SALE' : '📦 PURCHASE';
      const amount = `$${t.totalAmount.toFixed(2)}`;
      const details = t.transactionType === 'sale' 
        ? `${t.customerEmail} - ${t.planName} (${t.quantity} QR codes)`
        : `${t.planName} (${t.quantity} QR codes)`;
      
      console.log(`${date} | ${type} | ${amount} | ${details}`);
    });

    console.log('\n✅ Sample data inserted successfully!');
    console.log('🔗 You can now view the billing history at: http://localhost:3000/partners/settings');

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  } finally {
    try {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    } catch (disconnectError) {
      console.error('❌ Error disconnecting from MongoDB:', disconnectError);
    }
  }
}

// Run the script
console.log('🎯 Starting PartnerTransaction sample data insertion...');
insertSampleData(); 