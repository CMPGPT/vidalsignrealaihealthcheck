// models/Report.ts
import mongoose, { Schema, model, models } from 'mongoose';

const ReportSchema = new Schema({
  chatId: { 
    type: String, 
    required: true
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
  // expiryTime removed - will use PublicLink validTo time instead
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// TTL index removed since we use PublicLink time

export const Report = models.Report || model('Report', ReportSchema);