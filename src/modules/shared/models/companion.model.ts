import mongoose, { Document, Schema } from "mongoose";
import { RelationshipType } from "../../../types/roles";

export interface ICompanion extends Document {
  firstName: string;
  lastName: string;
  relationship: RelationshipType;
  email: string;
  phoneNumber: string;
  password?: string; // Permanent password (optional)
  isRegistered: boolean;
  tempPassword?: string;
  userId: mongoose.Types.ObjectId; // Reference to the main user
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
    password: { type: String }, // Optional permanent password
    isRegistered: { type: Boolean, default: false },
    tempPassword: { type: String },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "Account", 
      required: true 
    }
  },
  { timestamps: true }
);

export const CompanionModel = mongoose.model<ICompanion>("Companion", CompanionSchema); 