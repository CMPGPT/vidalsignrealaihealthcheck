import mongoose, { Schema, model, models } from 'mongoose';

const PaymentHistorySchema = new Schema({
  partnerId: { 
    type: String, 
    required: true,
    index: true
  },
  transactionId: { 
    type: String, 
    required: true,
    unique: true
  },
  packageName: { 
    type: String, 
    required: true 
  },
  count: { 
    type: Number, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'usd' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  stripeSessionId: {
    type: String
  },
  stripePaymentIntentId: {
    type: String
  }
});

export const PaymentHistory = models.PaymentHistory || model('PaymentHistory', PaymentHistorySchema); 