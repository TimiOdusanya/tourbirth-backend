import { UserModel } from "../models/userProfile.model";
import { UserBookingModel } from "../../shared/models/userBooking.model";
import { AuthenticatedRequest } from "../../../types/express";
import mongoose from "mongoose";

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: Date;
  maritalStatus?: string;
  anniversaryDate?: Date;
  address?: string;
  instagramUsername?: string;
}

export interface UpdateProfilePictureData {
  profilePicture: {
    name: string;
    size: number;
    type: string;
    link: string;
  }[];
}

export class UserService {
  // Update user profile information
  static async updateUserProfile(userId: string, updateData: UpdateUserProfileData) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -verificationOTP -resetPasswordOTP');

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Update user profile picture
  static async updateProfilePicture(userId: string, profilePictureData: UpdateProfilePictureData) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { profilePicture: profilePictureData.profilePicture } },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -verificationOTP -resetPasswordOTP');

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Get all bookings for a user
  static async getUserBookings(userId: string, filters: {
    page?: number;
    limit?: number;
    status?: string;
    bookingType?: string;
    isPrimary?: boolean;
  } = {}) {
    console.log("getUserBookings called with userId:", userId);
    
    const {
      page = 1,
      limit = 10,
      status,
      bookingType,
      isPrimary
    } = filters;

    const query: any = { 
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true 
    };

    console.log("User bookings query:", JSON.stringify(query, null, 2));

    if (status) {
      query.status = status;
    }

    // Handle bookingType filter - check both bookingType field and isPrimary
    if (bookingType) {
      if (bookingType === 'primary') {
        query.isPrimary = true;
      } else if (bookingType === 'companion') {
        query.isPrimary = false;
      } else {
        query.bookingType = bookingType;
      }
    }

    if (isPrimary !== undefined) {
      query.isPrimary = isPrimary;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      UserBookingModel.find(query)
        .populate("destination", "city country image")
        .populate("companions", "firstName lastName email phoneNumber relationship")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserBookingModel.countDocuments(query)
    ]);

    console.log("Found bookings:", bookings.length);
    console.log("Total count:", total);

    return {
      bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBookings: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Get a specific booking for a user
  static async getUserBookingById(userId: string, bookingId: string) {
    // Check if bookingId is a valid ObjectId or custom bookingId
    const isObjectId = mongoose.Types.ObjectId.isValid(bookingId);
    
    let query: any = {
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true
    };

    if (isObjectId) {
      query._id = new mongoose.Types.ObjectId(bookingId);
    } else {
      query.bookingId = bookingId;
    }

    const booking = await UserBookingModel.findOne(query)
      .populate("destination", "city country image description")
      .populate("companions", "firstName lastName email phoneNumber relationship")
      .lean();

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  }

  // Get user profile by ID
  static async getUserProfile(userId: string) {
    const user = await UserModel.findById(userId)
      .select('-password -twoFactorSecret -verificationOTP -resetPasswordOTP')
      .lean();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Get user booking statistics
  static async getUserBookingStats(userId: string) {
    const totalBookings = await UserBookingModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true
    });

    const primaryBookings = await UserBookingModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      isPrimary: true
    });

    const companionBookings = await UserBookingModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      isPrimary: false
    });

    const statusStats = await UserBookingModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isActive: true
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      totalBookings,
      primaryBookings,
      companionBookings,
      statusStats
    };
  }

  // Debug method to get all bookings for a user without filters
  static async debugGetAllUserBookings(userId: string) {
    console.log("Debug: Getting all bookings for userId:", userId);
    
    const query = { 
      userId: new mongoose.Types.ObjectId(userId)
    };
    
    console.log("Debug query:", JSON.stringify(query, null, 2));
    
    const bookings = await UserBookingModel.find(query)
      .populate("destination", "city country image")
      .populate("companions", "firstName lastName email phoneNumber relationship")
      .sort({ createdAt: -1 })
      .lean();
    
    console.log("Debug: Found bookings:", bookings.length);
    
    return bookings;
  }
}
