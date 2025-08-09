import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  firstName: string;
  middleName: string;
  fullName: string;
  surname: string;
  gender: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  profilePicture: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  verificationOTP?: string;
  resetPasswordOTP?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
      default: "",
    },
    fullName: {
      type: String,
    },
    surname: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      // enum: Object.values(userGender),
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: "",
    },
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
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
