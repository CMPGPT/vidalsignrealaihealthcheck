// models/Report.ts
import mongoose, { Schema, model, models } from 'mongoose';

const ReportSchema = new Schema({
  chatId: { 
    type: String, 
    required: true, 
    index: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  title: String,
  date: String,
  summary: String,
  suggestedQuestions: [String],
  recommendationQuestions: [String],
  expiryTime: { 
    type: Date, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Add TTL index on expiryTime
ReportSchema.index({ expiryTime: 1 }, { expireAfterSeconds: 0 });

export const Report = models.Report || model('Report', ReportSchema);