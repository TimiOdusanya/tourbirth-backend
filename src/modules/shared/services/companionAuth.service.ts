import { CompanionModel, ICompanion } from "../models/companion.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const companionLogin = async (email: string, password: string) => {
  const companion = await CompanionModel.findOne({ email }).exec();
  if (!companion) {
    throw new Error("Companion not found");
  }

  // Check if companion is using temporary password
  if (companion.tempPassword && companion.tempPassword === password) {
    // Allow login with temporary password
    const accessToken = jwt.sign(
      { 
        companionId: companion._id, 
        userId: companion.userId,
        role: "companion",
        isTempPassword: true 
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h", // Shorter expiry for temporary passwords
      }
    );

    return { 
      companion, 
      accessToken,
      isTempPassword: true,
      message: "Please update your password after first login"
    };
  }

  // If companion has set a permanent password, use that
  if (companion.password && await bcrypt.compare(password, companion.password)) {
    const accessToken = jwt.sign(
      { 
        companionId: companion._id, 
        userId: companion.userId,
        role: "companion",
        isTempPassword: false 
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return { 
      companion, 
      accessToken,
      isTempPassword: false
    };
  }

  throw new Error("Invalid email or password");
};

export const updateCompanionProfile = async (companionId: string, updateData: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  password?: string;
}) => {
  const companion = await CompanionModel.findById(companionId);
  if (!companion) {
    throw new Error("Companion not found");
  }

  // If updating password, hash it and remove temp password
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
    companion.tempPassword = undefined; // Remove temporary password
    companion.isRegistered = true; // Mark as fully registered
  }

  Object.assign(companion, updateData);
  await companion.save();

  return companion;
};

export const getCompanionProfile = async (companionId: string) => {
  const companion = await CompanionModel.findById(companionId)
    .select('-tempPassword -password');
  
  if (!companion) {
    throw new Error("Companion not found");
  }

  return companion;
};

export const changeCompanionPassword = async (companionId: string, oldPassword: string, newPassword: string) => {
  const companion = await CompanionModel.findById(companionId);
  if (!companion) {
    throw new Error("Companion not found");
  }

  // Check if companion has a permanent password
  if (!companion.password) {
    throw new Error("No permanent password set. Please set your first password.");
  }

  // Check if the old password matches
  const isOldPasswordValid = await bcrypt.compare(oldPassword, companion.password);
  if (!isOldPasswordValid) {
    throw new Error("Old password is incorrect");
  }

  // Check if the new password is the same as the old password
  const isNewPasswordSame = await bcrypt.compare(newPassword, companion.password);
  if (isNewPasswordSame) {
    throw new Error("New password cannot be the same as the old password");
  }

  // Hash and save the new password
  companion.password = await bcrypt.hash(newPassword, 12);
  companion.tempPassword = undefined; // Remove any temporary password
  companion.isRegistered = true; // Mark as fully registered
  await companion.save();

  return { message: "Password changed successfully" };
};
