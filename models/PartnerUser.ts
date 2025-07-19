import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPartnerUser extends Document {
  unique_id: string;
  first_Name: string;
  last_Name: string;
  state: string;
  organization_name: string;
  email: string;
  password: string;
  website_link?: string;
  phone?: string;
  business_address?: string;
  city?: string;
  zip?: string;
  business_type?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  secureLinksGenerated?: number;
  qrCodesCreated?: number;
  totalRevenue?: number;
}

const PartnerUserSchema: Schema = new Schema(
  {
    unique_id: { type: String, required: true, unique: true },
    first_Name: { type: String, required: true },
    last_Name: { type: String, required: true },
    state: { type: String, required: true },
    organization_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    website_link: { type: String },
    phone: { type: String },
    business_address: { type: String },
    city: { type: String },
    zip: { type: String },
    business_type: { type: String },
    stripePublishableKey: { type: String },
    stripeSecretKey: { type: String },
    stripeWebhookSecret: { type: String },
    secureLinksGenerated: { type: Number, default: 0 },
    qrCodesCreated: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PartnerUser: Model<IPartnerUser> =
  mongoose.models.PartnerUser || mongoose.model<IPartnerUser>('PartnerUser', PartnerUserSchema);

export default PartnerUser;
