import mongoose, { Document, Schema } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

const NewsletterSchema = new Schema<INewsletter>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  }
}, {
  timestamps: true
});

NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ isActive: 1 });
NewsletterSchema.index({ subscribedAt: -1 });

export const NewsletterModel = mongoose.model<INewsletter>("Newsletter", NewsletterSchema);
