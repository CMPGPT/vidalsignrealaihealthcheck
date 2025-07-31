import mongoose, { Schema, model, models } from 'mongoose';

const SecureLinkSchema = new Schema({
  linkId: { 
    type: String, 
    required: true, 
    unique: true
  },
  partnerId: { 
    type: String, 
    required: true 
  },
  chatId: { 
    type: String, 
    required: true 
  },
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  usedAt: { 
    type: Date 
  },
  expiresAt: { 
    type: Date, 
    required: false 
  },
  batchNo: {
    type: String,
    default: 'basicstarter'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
});

// Add TTL index on expiresAt
SecureLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SecureLink = models.SecureLink || model('SecureLink', SecureLinkSchema); 