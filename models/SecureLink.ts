import mongoose, { Schema, model, models } from 'mongoose';

const SecureLinkSchema = new Schema({
  linkId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
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
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Add TTL index on expiresAt
SecureLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SecureLink = models.SecureLink || model('SecureLink', SecureLinkSchema); 