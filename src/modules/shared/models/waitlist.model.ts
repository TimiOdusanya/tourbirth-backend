import mongoose, { Document, Schema } from "mongoose";

export interface IWaitlist extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  tripType: string;
  additionalInformation?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistSchema = new Schema<IWaitlist>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  tripType: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  additionalInformation: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
WaitlistSchema.index({ email: 1 });
WaitlistSchema.index({ isActive: 1 });
WaitlistSchema.index({ tripType: 1 });
WaitlistSchema.index({ createdAt: -1 });

export const WaitlistModel = mongoose.model<IWaitlist>("Waitlist", WaitlistSchema);
