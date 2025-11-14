import mongoose, { Document, Schema } from "mongoose";

export interface IDestination extends Document {
  city: string;
  country: string;
  isActive: boolean;
}

const DestinationSchema = new Schema<IDestination>(
  {
    city: { type: String, required: true },
    country: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Compound index to ensure city + country combination is unique
DestinationSchema.index({ city: 1, country: 1 }, { unique: true });

export const DestinationModel = mongoose.model<IDestination>("Destination", DestinationSchema); 