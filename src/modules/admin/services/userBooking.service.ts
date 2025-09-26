import { UserModel, IUser } from "../../user/models/userProfile.model";
import { CompanionModel, ICompanion } from "../../shared/models/companion.model";
import { DestinationModel, IDestination } from "../../shared/models/destination.model";
import { generateTempPassword, sendCompanionWelcomeEmail } from "../../../utils/companionUtils";
import { BookingStatus } from "../../../types/roles";
import mongoose from "mongoose";

export interface UpdateUserBookingData {
  // User booking details
  destinationId?: string;
  travelDate?: Date;
  returnDate?: Date;
  amount?: number;
  description?: string;
  status?: BookingStatus;
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
  // Generated fields (will be set automatically)
  bookingId?: string;
  packageName?: string;
  bookingDate?: Date;
  isBooked?: boolean;
  // Companion management
  companions?: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    email: string;
    phoneNumber: string;
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

export class UserBookingService {
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

  // Update user booking (including adding/updating companions)
  static async updateUserBooking(userId: string, updateData: UpdateUserBookingData): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If this is the first time setting a destination, generate unique IDs
    if (updateData.destinationId && !user.bookingId) {
      const { bookingId, packageName } = this.generateUniqueIds();
      updateData.bookingId = bookingId;
      updateData.packageName = packageName;
      updateData.bookingDate = new Date();
      updateData.isBooked = true;
    }

    // Update user booking information
    const userUpdateData: any = {};
    
    if (updateData.destinationId) userUpdateData.destination = updateData.destinationId;
    if (updateData.travelDate) userUpdateData.travelDate = new Date(updateData.travelDate);
    if (updateData.returnDate) userUpdateData.returnDate = new Date(updateData.returnDate);
    if (updateData.amount) userUpdateData.amount = updateData.amount;
    if (updateData.description) userUpdateData.description = updateData.description;
    if (updateData.status) userUpdateData.status = updateData.status;
    if (updateData.documents) userUpdateData.documents = updateData.documents;
    if (updateData.itineraries) userUpdateData.itineraries = updateData.itineraries;
    if (updateData.bookingId) userUpdateData.bookingId = updateData.bookingId;
    if (updateData.packageName) userUpdateData.packageName = updateData.packageName;
    if (updateData.bookingDate) userUpdateData.bookingDate = updateData.bookingDate;
    if (updateData.isBooked !== undefined) userUpdateData.isBooked = updateData.isBooked;

    // Apply user updates
    Object.assign(user, userUpdateData);
    await user.save();

    // Handle companions if provided
    if (updateData.companions && updateData.companions.length > 0) {
      await this.updateUserCompanions(userId, updateData.companions);
    }

    return user;
  }

  // Update user companions (add new ones, update existing ones)
  private static async updateUserCompanions(userId: string, companionsData: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    email: string;
    phoneNumber: string;
  }>): Promise<void> {
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

    // Get existing companions for this user
    const existingCompanions = await CompanionModel.find({ userId });
    const existingEmails = existingCompanions.map(c => c.email);

    // Process each companion
    for (const companionData of companionsData) {
      let companion: ICompanion;

      // Check if companion already exists
      const existingCompanion = existingCompanions.find(c => c.email === companionData.email);
      
      if (existingCompanion) {
        // Update existing companion
        Object.assign(existingCompanion, companionData);
        await existingCompanion.save();
        companion = existingCompanion;
      } else {
        // Create new companion
        const tempPassword = generateTempPassword();
        
        companion = new CompanionModel({
          ...companionData,
          userId,
          tempPassword,
          isRegistered: false,
          bookingStatus: user.status || BookingStatus.PENDING // Set initial status to user's booking status
        });

        await companion.save();

        // Send welcome email to new companion
        try {
          await sendCompanionWelcomeEmail(
            companion,
            {
              packageName: user.packageName || 'TB-Package',
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
    }

    // Remove companions that are no longer in the list
    const newEmails = companionsData.map(c => c.email);
    const companionsToRemove = existingCompanions.filter(c => !newEmails.includes(c.email));
    
    for (const companion of companionsToRemove) {
      await CompanionModel.findByIdAndDelete(companion._id);
    }
  }

  // Get user booking by ID (including all companions)
  static async getUserBookingById(userId: string): Promise<{
    user: IUser;
    companions: ICompanion[];
  } | null> {
    const user = await UserModel.findById(userId)
      .select('-password -verificationOTP -resetPasswordOTP')
      .populate('destination', 'city country');

    if (!user) {
      return null;
    }

    // Get all companions for this user
    const companions = await CompanionModel.find({ userId }).sort({ createdAt: -1 });

    return {
      user,
      companions
    };
  }

  // Update user booking status
  static async updateUserBookingStatus(userId: string, status: BookingStatus): Promise<IUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.status = status;
    await user.save();

    return user;
  }

  // Get all user bookings with pagination and filters
  static async getAllUserBookings(filters: {
    page?: number;
    limit?: number;
    status?: string;
    packageName?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, status, packageName, search } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter object
    const filter: any = { isBooked: true };
    
    if (status) filter.status = status;
    if (packageName) filter.packageName = { $regex: packageName, $options: 'i' };
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } },
        { packageName: { $regex: search, $options: 'i' } }
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
