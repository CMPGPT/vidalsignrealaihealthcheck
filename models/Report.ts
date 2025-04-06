// File: models/Report.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IReport extends Document {
  chatId: string;
  title: string;
  date: string;
  summary: string;
  suggestedQuestions: string[];
  recommendationQuestions: string[];
  expiryTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    chatId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    suggestedQuestions: {
      type: [String],
      default: [],
    },
    recommendationQuestions: {
      type: [String],
      default: [],
    },
    expiryTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

// Avoid re-compilation in dev mode (Next.js hot reload)
export const Report = models.Report || model<IReport>("Report", ReportSchema);