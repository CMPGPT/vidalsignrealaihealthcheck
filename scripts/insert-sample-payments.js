const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vidalsignrealaihealthcheck');

// Payment History Schema
const paymentHistorySchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  partnerId: { type: String, required: true },
  packageName: { type: String, required: true },
  count: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true, enum: ['completed', 'pending', 'failed'] },
  currency: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  paymentDate: { type: Date, required: true }
}, { timestamps: true });

const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

// Secure Link Schema
const secureLinkSchema = new mongoose.Schema({
  linkId: { type: String, required: true, unique: true },
  partnerId: { type: String, required: true },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const SecureLink = mongoose.model('SecureLink', secureLinkSchema);

async function insertSampleData() {
  try {
    console.log('✅ Connecting to MongoDB...');
    
    // Clear existing data
    await PaymentHistory.deleteMany({});
    await SecureLink.deleteMany({});
    
    // Insert sample payment history
    const samplePayments = [
      {
        transactionId: 'TXN001',
        partnerId: '687e6db60f7d9abe455c4b53',
        packageName: 'Premium QR Package',
        count: 500,
        amount: 299.99,
        status: 'completed',
        currency: 'USD',
        paymentMethod: 'Credit Card',
        paymentDate: new Date('2025-01-21T23:21:10Z')
      },
      {
        transactionId: 'TXN002',
        partnerId: '687e6db60f7d9abe455c4b54',
        packageName: 'Basic QR Package',
        count: 100,
        amount: 99.99,
        status: 'completed',
        currency: 'USD',
        paymentMethod: 'PayPal',
        paymentDate: new Date('2025-01-20T15:30:00Z')
      },
      {
        transactionId: 'TXN003',
        partnerId: '687e6db60f7d9abe455c4b55',
        packageName: 'Enterprise QR Package',
        count: 1000,
        amount: 599.99,
        status: 'pending',
        currency: 'USD',
        paymentMethod: 'Bank Transfer',
        paymentDate: new Date('2025-01-19T10:15:00Z')
      }
    ];
    
    await PaymentHistory.insertMany(samplePayments);
    console.log('✅ Sample payment history inserted');
    
    // Insert sample secure links for the first payment
    const sampleLinks = [];
    const partnerId = '687e6db60f7d9abe455c4b53';
    const paymentDate = new Date('2025-01-21T23:21:10Z');
    
    for (let i = 1; i <= 50; i++) {
      sampleLinks.push({
        linkId: `LINK_${partnerId}_${i.toString().padStart(3, '0')}`,
        partnerId: partnerId,
        isUsed: Math.random() > 0.7, // 30% chance of being used
        createdAt: new Date(paymentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000) // Random time within 24 hours
      });
    }
    
    await SecureLink.insertMany(sampleLinks);
    console.log('✅ Sample secure links inserted');
    
    console.log('📊 Sample data summary:');
    console.log(`   - ${samplePayments.length} payment records`);
    console.log(`   - ${sampleLinks.length} secure links`);
    console.log(`   - Used links: ${sampleLinks.filter(link => link.isUsed).length}`);
    console.log(`   - Unused links: ${sampleLinks.filter(link => !link.isUsed).length}`);
    
  } catch (err) {
    console.error('❌ Error inserting sample data:', err);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

insertSampleData(); 