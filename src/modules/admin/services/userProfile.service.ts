import { UserModel, IUser } from "../../user/models/userProfile.model";
import { AdminModel, IAdmin } from "../models/adminProfile.model";

export interface UpdateProfileData {
  firstName?: string;
  surname?: string;
  middleName?: string;
  fullName?: string;
  gender?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  maritalStatus?: string;
  anniversaryDate?: Date;
  address?: string;
  instagramUsername?: string;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

export class UserProfileService {
  // Admin updates any user profile
  static async updateUserProfileByAdmin(userId: string, updateData: UpdateProfileData): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user profile
    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  // User updates their own profile
  static async updateOwnProfile(userId: string, updateData: UpdateProfileData): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update user profile
    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  // Admin updates their own profile
  static async updateAdminProfile(adminId: string, updateData: Partial<IAdmin>): Promise<IAdmin> {
    const admin = await AdminModel.findById(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // Update admin profile
    Object.assign(admin, updateData);
    await admin.save();

    return admin;
  }

  // Get user profile by ID (admin only)
  static async getUserProfileById(userId: string): Promise<IUser | null> {
    return await UserModel.findById(userId)
      .select('-password -verificationOTP -resetPasswordOTP');
  }

  // Remove sensitive data from user response
  static sanitizeUserResponse(user: IUser): Partial<IUser> {
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).verificationOTP;
    delete (userResponse as any).resetPasswordOTP;
    return userResponse;
  }

  // Remove sensitive data from admin response
  static sanitizeAdminResponse(admin: IAdmin): Partial<IAdmin> {
    const adminResponse = admin.toObject();
    delete (adminResponse as any).password;
    delete (adminResponse as any).verificationOTP;
    delete (adminResponse as any).resetPasswordOTP;
    return adminResponse;
  }
} 