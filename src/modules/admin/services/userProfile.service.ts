import { UserModel, IUser } from "../../user/models/userProfile.model";
import { AdminModel, IAdmin } from "../models/adminProfile.model";
import { CompanionModel, ICompanion } from "../../shared/models/companion.model";
import { generateTempPassword, sendCompanionWelcomeEmail } from "../../../utils/companionUtils";
import { DestinationModel } from "../../shared/models/destination.model";
import { BookingStatus } from "../../../types/roles";
import mongoose from "mongoose";

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
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
  // Booking related fields
  bookingId?: string;
  packageName?: string;
  status?: BookingStatus;
  destination?: string;
  travelDate?: Date;
  returnDate?: Date;
  bookingDate?: Date;
  amount?: number;
  description?: string;
  isBooked?: boolean;
  documents?: Array<{
    name: string;
    size: number;
    type: string;
    link: string;
  }>;
  itineraries?: Array<{
    name: string;
    size: number;
    type: string;
    link: string;
  }>;
}

export interface AddCompanionsData {
  companions: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    email: string;
    phoneNumber: string;
  }>;
}

export class UserProfileService {
  // Generate unique booking ID and package name
  private static generateUniqueIds(): { bookingId: string; packageName: string } {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const baseId = `TB-${timestamp}-${random}`.toUpperCase();
    
    return {
      bookingId: baseId,
      packageName: baseId
    };
  }

  // Admin updates any user profile
  static async updateUserProfileByAdmin(userId: string, updateData: UpdateProfileData): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If this is the first time booking, generate unique IDs
    if (updateData.destination && !user.bookingId) {
      const { bookingId, packageName } = this.generateUniqueIds();
      updateData.bookingId = bookingId;
      updateData.packageName = packageName;
      updateData.bookingDate = new Date();
      updateData.isBooked = true;
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
      .select('-password -verificationOTP -resetPasswordOTP')
      .populate('destination', 'city country');
  }

  // Add companions to a user
  static async addCompanionsToUser(userId: string, companionsData: AddCompanionsData): Promise<ICompanion[]> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.destination) {
      throw new Error("User must have a destination before adding companions");
    }

    const destination = await DestinationModel.findById(user.destination);
    if (!destination) {
      throw new Error("Destination not found");
    }

    const companions: ICompanion[] = [];
    
    for (const companionData of companionsData.companions) {
      const tempPassword = generateTempPassword();
      
      const companion = new CompanionModel({
        ...companionData,
        userId,
        tempPassword,
        isRegistered: false
      });

      await companion.save();
      companions.push(companion);

      // Send welcome email to companion
      try {
        await sendCompanionWelcomeEmail(
          companion,
          {
            packageName: user.bookingId || 'TB-Package',
            bookingId: user.bookingId || 'TB-Booking',
            travelDate: user.travelDate || new Date(),
            description: user.description || 'Trip details'
          } as any,
          destination,
          tempPassword
        );
      } catch (emailError) {
        console.error("Failed to send companion email:", emailError);
      }
    }

    return companions;
  }

  // Get companions for a user
  static async getUserCompanions(userId: string): Promise<ICompanion[]> {
    return await CompanionModel.find({ userId }).sort({ createdAt: -1 });
  }

  // Update companion information
  static async updateCompanion(companionId: string, updateData: Partial<ICompanion>): Promise<ICompanion> {
    const companion = await CompanionModel.findById(companionId);
    if (!companion) {
      throw new Error("Companion not found");
    }

    Object.assign(companion, updateData);
    await companion.save();

    return companion;
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

  // Get all users with pagination and filters
  static async getAllUsers(filters: {
    page?: number;
    limit?: number;
    status?: BookingStatus;
    search?: string;
    isBooked?: boolean;
  }) {
    const { page = 1, limit = 10, status, search, isBooked } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter object
    const filter: any = {};
    
    if (status) filter.status = status;
    if (isBooked !== undefined) filter.isBooked = isBooked;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await UserModel.find(filter)
      .select('-password -verificationOTP -resetPasswordOTP')
      .populate('destination', 'city country')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await UserModel.countDocuments(filter);

    return {
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    };
  }
} 