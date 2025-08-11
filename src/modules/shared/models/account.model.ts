// src/modules/account/models/account.model.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { Role } from "../../../types/roles";

export interface IAccountBase extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePicture: {
    name?: string;
    size?: number;
    type?: string;
    link?: string;
  }[];
  verificationOTP?: string;
  resetPasswordOTP?: string;
  role: Role ;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const BaseAccountSchema = new Schema<IAccountBase>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: [
      {
        name: { type: String },
        size: { type: Number },
        type: { type: String },
        link: { type: String },
      },
    ],
    verificationOTP: String,
    resetPasswordOTP: String,
    role: { type: String, enum: Object.values(Role), required: true }
  },
  { timestamps: true, discriminatorKey: "role" }
);

// Hash password before save
BaseAccountSchema.pre<IAccountBase>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
BaseAccountSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const AccountModel = mongoose.model<IAccountBase>("Account", BaseAccountSchema);
