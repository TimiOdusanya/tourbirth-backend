import mongoose, { Document, Schema } from "mongoose";
import { RelationshipType, BookingStatus } from "../../../types/roles";

export interface ICompanion extends Document {
  firstName: string;
  lastName: string;
  relationship: RelationshipType;
  email: string;
  phoneNumber: string;
  password?: string;
  isRegistered: boolean;
  tempPassword?: string;
  userId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  bookingStatus: BookingStatus;
}

const CompanionSchema = new Schema<ICompanion>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    relationship: { 
      type: String, 
      enum: Object.values(RelationshipType), 
      required: true 
    },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    password: { type: String },
    isRegistered: { type: Boolean, default: false },
    tempPassword: { type: String },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "user", 
      required: true 
    },
    bookingId: { 
      type: Schema.Types.ObjectId, 
      ref: "UserBooking", 
      required: true 
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING
    }
  },
  { timestamps: true }
);

export const CompanionModel = mongoose.model<ICompanion>("Companion", CompanionSchema); 