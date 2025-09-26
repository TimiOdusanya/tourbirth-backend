import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  fullName: string;
  email: string;
  dreamDestination: string;
  travelDate: Date;
  story: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>({
  fullName: {
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
  dreamDestination: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  travelDate: {
    type: Date,
    required: true
  },
  story: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});


ContactSchema.index({ email: 1 });
ContactSchema.index({ isActive: 1 });
ContactSchema.index({ dreamDestination: 1 });
ContactSchema.index({ travelDate: 1 });
ContactSchema.index({ createdAt: -1 });

export const ContactModel = mongoose.model<IContact>("Contact", ContactSchema);
