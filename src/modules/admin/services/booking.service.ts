import { UserBookingModel, IUserBooking } from "../../shared/models/userBooking.model";
import { UserModel } from "../../user/models/userProfile.model";
import { CompanionModel, ICompanion } from "../../shared/models/companion.model";
import { DestinationModel } from "../../shared/models/destination.model";
import { generateTempPassword, sendCompanionWelcomeEmail } from "../../../utils/companionUtils";
import { BookingStatus } from "../../../types/roles";
import mongoose from "mongoose";

export interface CreateBookingData {
  userId: string;
  destinationId: string;
  travelDate: Date;
  returnDate: Date;
  amount: number;
  description: string;
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
  companions?: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    email: string;
    phoneNumber: string;
  }>;
}

export interface UpdateBookingData {
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
  companions?: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    email: string;
    phoneNumber: string;
  }>;
}

export interface BookingFilters {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  packageName?: string;
  destinationId?: string;
  search?: string;
}

export class BookingService {
  // Create a new booking for a user
  static async createBooking(data: CreateBookingData): Promise<IUserBooking> {
    const { userId, destinationId, companions, ...bookingData } = data;

    // Verify user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify destination exists
    const destination = await DestinationModel.findById(destinationId);
    if (!destination) {
      throw new Error("Destination not found");
    }

    // Create primary booking
    const primaryBooking = new UserBookingModel({
      ...bookingData,
      userId: new mongoose.Types.ObjectId(userId),
      destination: new mongoose.Types.ObjectId(destinationId),
      isPrimary: true,
      companions: []
    });

    await primaryBooking.save();

    // Handle companions if provided
    if (companions && companions.length > 0) {
      await this.addCompanionsToBooking((primaryBooking._id as mongoose.Types.ObjectId).toString(), companions, destination);
    }

    return primaryBooking;
  }

  // Add companions to an existing booking
  static async addCompanionsToBooking(
    bookingId: string, 
    companionsData: Array<{
      firstName: string;
      lastName: string;
      relationship: string;
      email: string;
      phoneNumber: string;
    }>,
    destination?: any
  ): Promise<void> {
    const primaryBooking = await UserBookingModel.findById(bookingId);
    if (!primaryBooking) {
      throw new Error("Booking not found");
    }

    // Get destination if not provided
    if (!destination) {
      destination = await DestinationModel.findById(primaryBooking.destination);
    }

    // Process each companion
    for (const companionData of companionsData) {
      // Check if companion already exists for this user
      let companion = await CompanionModel.findOne({ 
        email: companionData.email,
        userId: primaryBooking.userId 
      });

      if (!companion) {
        // Create new companion
        const tempPassword = generateTempPassword();
        
        companion = new CompanionModel({
          ...companionData,
          userId: primaryBooking.userId,
          tempPassword,
          isRegistered: false
        });

        await companion.save();

        // Send welcome email to new companion
        try {
          await sendCompanionWelcomeEmail(
            companion,
            {
              packageName: primaryBooking.packageName,
              bookingId: primaryBooking.bookingId,
              travelDate: primaryBooking.travelDate,
              description: primaryBooking.description
            } as any,
            destination,
            tempPassword
          );
        } catch (emailError) {
          console.error("Failed to send companion email:", emailError);
        }
      }

      // Create companion booking
      const companionBooking = new UserBookingModel({
        packageName: primaryBooking.packageName, // Same package name as primary
        userId: companion._id,
        destination: primaryBooking.destination,
        travelDate: primaryBooking.travelDate,
        returnDate: primaryBooking.returnDate,
        amount: primaryBooking.amount,
        description: primaryBooking.description,
        status: primaryBooking.status,
        documents: primaryBooking.documents,
        itineraries: primaryBooking.itineraries,
        isPrimary: false,
        companions: []
      });

      await companionBooking.save();

      // Add companion to primary booking's companions array
      primaryBooking.companions.push(companion._id as mongoose.Types.ObjectId);
    }

    await primaryBooking.save();
  }

  // Get all bookings for a specific user
  static async getUserBookings(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      UserBookingModel.find({ 
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true 
      })
        .populate("destination", "city country")
        .populate("companions", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserBookingModel.countDocuments({ 
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true 
      })
    ]);

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


  static async getBookingById(bookingId: string): Promise<IUserBooking | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(bookingId);
    
    const query: any = { isActive: true };
    
    if (isObjectId) {
      query._id = new mongoose.Types.ObjectId(bookingId);
    } else {
      query.bookingId = bookingId;
    }
    
    return await UserBookingModel.findOne(query)
      .populate("userId", "firstName lastName email")
      .populate("destination", "city country")
      .populate("companions", "firstName lastName email relationship");
  }

  // Update booking
  static async updateBooking(bookingId: string, data: UpdateBookingData): Promise<IUserBooking | null> {
    // Extract companions data to handle separately
    const { companions, ...updateData } = data;
    
    // Convert destinationId to destination ObjectId if provided
    if (data.destinationId) {
      (updateData as any).destination = new mongoose.Types.ObjectId(data.destinationId);
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(bookingId);
    
    const query: any = { isActive: true };
    
    if (isObjectId) {
      query._id = new mongoose.Types.ObjectId(bookingId);
    } else {
      query.bookingId = bookingId;
    }

    const booking = await UserBookingModel.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    );

    // If companions are being updated, handle them separately
    if (companions && booking) {
      await this.addCompanionsToBooking((booking._id as mongoose.Types.ObjectId).toString(), companions);
    }

    // Return the booking with populated data
    if (!booking) return null;
    
    return await UserBookingModel.findById(booking._id)
      .populate("userId", "firstName lastName email")
      .populate("destination", "city country")
      .populate("companions", "firstName lastName email relationship");
  }

  // Delete booking (soft delete)
  static async deleteBooking(bookingId: string): Promise<boolean> {
    const isObjectId = mongoose.Types.ObjectId.isValid(bookingId);
    
    const query: any = { isActive: true };
    
    if (isObjectId) {
      query._id = new mongoose.Types.ObjectId(bookingId);
    } else {
      query.bookingId = bookingId;
    }

    const result = await UserBookingModel.findOneAndUpdate(
      query,
      { isActive: false }
    );

    return !!result;
  }

  // Get all bookings with filters (admin)
  static async getAllBookings(filters: BookingFilters = {}) {
    const {
      page = 1,
      limit = 10,
      status,
      packageName,
      destinationId,
      search
    } = filters;

    const query: any = { isActive: true };

    if (status) {
      query.status = status;
    }

    if (packageName) {
      query.packageName = { $regex: packageName, $options: "i" };
    }

    if (destinationId) {
      query.destination = new mongoose.Types.ObjectId(destinationId);
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: "i" } },
        { packageName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      UserBookingModel.find(query)
        .populate("userId", "firstName lastName email")
        .populate("destination", "city country")
        .populate("companions", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserBookingModel.countDocuments(query)
    ]);

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

  // Get user information and their bookings
  static async getUserInfoAndBookings(userId: string) {
    const user = await UserModel.findById(userId)
      .select('-password -verificationOTP -resetPasswordOTP')
      .populate('destination', 'city country');

    if (!user) {
      return null;
    }

    const bookings = await UserBookingModel.find({ 
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true 
    })
      .populate("destination", "city country")
      .populate("companions", "firstName lastName email relationship")
      .sort({ createdAt: -1 });

    return {
      user,
      bookings
    };
  }

  // Update booking status
  static async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<IUserBooking | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(bookingId);
    
    const query: any = { isActive: true };
    
    if (isObjectId) {
      query._id = new mongoose.Types.ObjectId(bookingId);
    } else {
      query.bookingId = bookingId;
    }

    return await UserBookingModel.findOneAndUpdate(
      query,
      { status },
      { new: true }
    )
      .populate("userId", "firstName lastName email")
      .populate("destination", "city country")
      .populate("companions", "firstName lastName email relationship");
  }
}
