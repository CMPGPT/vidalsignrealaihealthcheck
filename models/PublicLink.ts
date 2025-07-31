import mongoose, { Schema, Document } from 'mongoose';

export interface IPublicLink extends Document {
  chatId: string;
  email: string;
  isOpen: boolean;
  fileUploadCount: number;
  validFrom: Date;
  validTo: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PublicLinkSchema = new Schema<IPublicLink>({
  chatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  fileUploadCount: {
    type: Number,
    default: 0
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validTo: {
    type: Date,
    required: true,
    default: function() {
      // Set expiry to 30 minutes from creation
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 30);
      return expiry;
    }
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for finding valid links
PublicLinkSchema.index({ validTo: 1, isOpen: 1 });

// Method to check if link is still valid
PublicLinkSchema.methods.isValid = function(): boolean {
  const now = new Date();
  return this.isOpen && this.validTo > now;
};

// Method to mark link as used
PublicLinkSchema.methods.markAsUsed = function(): void {
  this.isUsed = true;
  this.save();
};

// Method to increment file upload count
PublicLinkSchema.methods.incrementFileUpload = function(): void {
  this.fileUploadCount += 1;
  this.save();
};

const PublicLink = mongoose.models.PublicLink || mongoose.model<IPublicLink>('PublicLink', PublicLinkSchema);

export default PublicLink; 