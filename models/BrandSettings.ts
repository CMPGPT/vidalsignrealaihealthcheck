import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBrandSettings extends Document {
  userId: string;
  brandName: string;
  logoUrl?: string;
  logoPublicId?: string; // For Cloudinary
  selectedTheme: string;
  websiteStyle: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  heroSection: {
    headline: string;
    subheadline: string;
    ctaText: string;
    secondaryCtaText: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  featuresSection: {
    title: string;
    subtitle: string;
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  pricingSection: {
    enabled: boolean;
    title: string;
    subtitle: string;
    plans: Array<{
      name: string;
      price: string;
      quantity: string;
      description: string;
      features: string[];
      popular: boolean;
      buttonText: string;
    }>;
  };
  websiteUrl?: string;
  isDeployed: boolean;
  lastDeployedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define theme schema
const ThemeColorsSchema = new Schema({
  primary: { 
    type: String, 
    required: true,
    default: '#3B82F6',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  secondary: { 
    type: String, 
    required: true,
    default: '#10B981',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  accent: { 
    type: String, 
    required: true,
    default: '#06b6d4',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  }
}, { _id: false });

// Define stat schema
const StatSchema = new Schema({
  value: { type: String, required: true },
  label: { type: String, required: true }
}, { _id: false });

// Define hero section schema
const HeroSectionSchema = new Schema({
  headline: { 
    type: String, 
    required: true,
    default: 'Understand Your Lab Results In Plain English'
  },
  subheadline: { 
    type: String, 
    required: true,
    default: 'Translate complex lab reports into clear, easy-to-understand explanations using advanced AI technology—no medical knowledge required.'
  },
  ctaText: { 
    type: String, 
    required: true,
    default: 'Upload Your Labs'
  },
  secondaryCtaText: { 
    type: String, 
    required: true,
    default: 'Learn More'
  },
  stats: [StatSchema]
}, { _id: false });

// Define feature schema
const FeatureSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }
}, { _id: false });

// Define features section schema
const FeaturesSectionSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    default: 'Two Simple Ways to Access'
  },
  subtitle: { 
    type: String, 
    required: true,
    default: 'Flexible access options for individuals and businesses, with no complex dashboards or management required.'
  },
  features: [FeatureSchema]
}, { _id: false });

// Define pricing plan schema
const PricingPlanSchema = new Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  quantity: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String }],
  popular: { type: Boolean, default: false },
  buttonText: { type: String, required: true }
}, { _id: false });

// Define pricing section schema
const PricingSectionSchema = new Schema({
  enabled: { type: Boolean, default: true },
  title: { 
    type: String, 
    required: true,
    default: 'QR Codes & Secure Links'
  },
  subtitle: { 
    type: String, 
    required: true,
    default: 'Purchase QR codes and secure links to share lab reports with your patients.'
  },
  plans: [PricingPlanSchema]
}, { _id: false });

const BrandSettingsSchema: Schema = new Schema(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true
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
    selectedTheme: {
      type: String,
      required: true,
      default: 'medical',
      enum: ['medical', 'wellness', 'fitness', 'therapy', 'modern']
    },
    websiteStyle: {
      type: String,
      required: true,
      default: 'classic',
      enum: ['classic', 'modern', 'creative']
    },
    customColors: {
      type: ThemeColorsSchema,
      required: true,
      default: () => ({
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#06b6d4'
      })
    },
    heroSection: {
      type: HeroSectionSchema,
      required: true,
      default: () => ({
        headline: 'Understand Your Lab Results In Plain English',
        subheadline: 'Translate complex lab reports into clear, easy-to-understand explanations using advanced AI technology—no medical knowledge required.',
        ctaText: 'Upload Your Labs',
        secondaryCtaText: 'Learn More',
        stats: [
          { value: '100K+', label: 'Healthcare Providers' },
          { value: '500K+', label: 'Patients Served' },
          { value: '4.9/5', label: 'Satisfaction Score' },
          { value: 'HIPAA', label: 'Compliant' }
        ]
      })
    },
    featuresSection: {
      type: FeaturesSectionSchema,
      required: true,
      default: () => ({
        title: 'Two Simple Ways to Access',
        subtitle: 'Flexible access options for individuals and businesses, with no complex dashboards or management required.',
        features: [
          {
            title: 'Simple Upload Process',
            description: 'Upload your lab reports as PDFs or images in seconds. Our AI automatically recognizes test results.',
            icon: 'upload'
          },
          {
            title: 'AI-Powered Explanations', 
            description: 'Receive clear explanations of your lab results with actionable insights in plain language.',
            icon: 'brain'
          },
          {
            title: 'HIPAA Compliant',
            description: 'All data is processed securely with full HIPAA compliance and encryption standards.',
            icon: 'shield'
          }
        ]
      })
    },
    pricingSection: {
      type: PricingSectionSchema,
      required: true,
      default: () => ({
        enabled: true,
        title: 'Partner With Us',
        subtitle: 'Offer AI-powered lab report translations to your clients and patients with our partner program.',
        plans: [
          {
            name: 'Starter Pack',
            price: '$29',
            quantity: '10 QR Codes',
            description: 'Perfect for small practices',
            features: [
              '10 QR Codes',
              'Secure link generation',
              'Basic support',
              '24-hour expiry'
            ],
            popular: false,
            buttonText: 'Purchase Now'
          }
        ]
      })
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