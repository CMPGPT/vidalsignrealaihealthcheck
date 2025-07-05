import mongoose, { Schema, model, models } from 'mongoose';

const QRCodeSchema = new Schema({
  id: { type: String, required: true, unique: true },
  partnerId: { type: String, required: true },
  batchId: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  url: { type: String },
  assigned: { type: Boolean, default: false },
  customerName: { type: String },
  customerId: { type: String },
  assignedDate: { type: Date },
  scanned: { type: Boolean, default: false },
  scanDate: { type: Date },
  redeemed: { type: Boolean, default: false },
  redemptionDate: { type: Date },
  metadata: { type: Schema.Types.Mixed },
  used: { type: Boolean, default: false },
  usedDate: { type: Date },
  usedBy: { type: String },
  generated: { type: String },
});

export const QRCode = models.QRCode || model('QRCode', QRCodeSchema); 