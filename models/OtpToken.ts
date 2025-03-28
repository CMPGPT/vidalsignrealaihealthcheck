// models/OtpToken.ts
import mongoose from 'mongoose';

const OtpTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartnerUser',
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  validateUntil: {
    type: Date,
    required: true,
  },
});

export default mongoose.models.OtpToken || mongoose.model('OtpToken', OtpTokenSchema);
