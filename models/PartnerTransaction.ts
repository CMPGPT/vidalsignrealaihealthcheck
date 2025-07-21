import mongoose, { Schema, Document } from 'mongoose';

export interface IPartnerTransaction extends Document {
  partnerId: string;
  transactionType: 'sale' | 'purchase';
  transactionId: string;
  customerEmail?: string;
  customerName?: string;
  planName: string;
  planPrice: number;
  quantity: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionDate: Date;
  metadata: {
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    secureLinkIds?: string[];
    qrCodeIds?: string[];
    partnerWebsiteUrl?: string;
    customerIp?: string;
    customerLocation?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PartnerTransactionSchema = new Schema<IPartnerTransaction>({
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

// Indexes for better query performance
PartnerTransactionSchema.index({ partnerId: 1, transactionDate: -1 });
PartnerTransactionSchema.index({ partnerId: 1, transactionType: 1 });
PartnerTransactionSchema.index({ customerEmail: 1 });
PartnerTransactionSchema.index({ status: 1 });

export const PartnerTransaction = mongoose.models.PartnerTransaction || 
  mongoose.model<IPartnerTransaction>('PartnerTransaction', PartnerTransactionSchema); 