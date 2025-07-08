import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBrandSettings extends Document {
  userId: string;
  brandName: string;
  logoUrl?: string;
  logoPublicId?: string; // For Cloudinary
  primaryColor: string;
  secondaryColor: string;
  websiteUrl?: string;
  isDeployed: boolean;
  lastDeployedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSettingsSchema: Schema = new Schema(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true
    },
    brandName: { 
      type: String, 
      required: true,
      trim: true
    },
    logoUrl: { 
      type: String,
      trim: true
    },
    logoPublicId: { 
      type: String,
      trim: true
    },
    primaryColor: { 
      type: String, 
      required: true,
      default: '#3B82F6', // Default blue
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    },
    secondaryColor: { 
      type: String, 
      required: true,
      default: '#10B981', // Default green
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    },
    websiteUrl: {
      type: String,
      trim: true
    },
    isDeployed: {
      type: Boolean,
      default: false
    },
    lastDeployedAt: {
      type: Date
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient queries
BrandSettingsSchema.index({ userId: 1 });

// Helper method to generate partner website URL
export const generatePartnerUrl = (brandName: string): string => {
  if (!brandName) return '';
  
  // Create URL-friendly slug from brand name
  const brandSlug = brandName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars except spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 50); // Limit length
  
  return `/partnerswebsite/${brandSlug}`;
};

const BrandSettings: Model<IBrandSettings> =
  mongoose.models.BrandSettings || mongoose.model<IBrandSettings>('BrandSettings', BrandSettingsSchema);

export default BrandSettings; 