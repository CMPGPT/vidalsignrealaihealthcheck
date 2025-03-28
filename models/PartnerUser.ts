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
  },
  { timestamps: true }
);

const PartnerUser: Model<IPartnerUser> =
  mongoose.models.PartnerUser || mongoose.model<IPartnerUser>('PartnerUser', PartnerUserSchema);

export default PartnerUser;
