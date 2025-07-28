import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAdminUser extends Document {
  email: string;
  password: string;
  userType: 'admin';
}

const AdminUserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true, default: 'admin', enum: ['admin'] },
  },
  { timestamps: true }
);

const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);

export default AdminUser; 