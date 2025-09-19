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
  bookingType?: "primary" | "companion";
  isPrimary?: boolean;
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
      bookingType: "primary",
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

    // Get primary user to check for email conflicts
    const primaryUser = await UserModel.findById(primaryBooking.userId);
    if (!primaryUser) {
      throw new Error("Primary user not found");
    }

    // Validate that no companion email matches the primary user's email
    const duplicateEmail = companionsData.find(companion => 
      companion.email.toLowerCase() === primaryUser.email.toLowerCase()
    );
    if (duplicateEmail) {
      throw new Error(`Cannot add "${duplicateEmail.email}" as a companion because this email belongs to the primary user of this booking.`);
    }

    // Clear existing companions for this booking
    primaryBooking.companions = [];
    await primaryBooking.save();

    // Process each companion
    for (const companionData of companionsData) {
      // Check if user already exists by email
      let user = await UserModel.findOne({ email: companionData.email });

      if (!user) {
        let tempPassword: string;
        try {
          // Create new user account for companion
          tempPassword = generateTempPassword();
          
          user = new UserModel({
            firstName: companionData.firstName,
            lastName: companionData.lastName,
            email: companionData.email,
            phoneNumber: companionData.phoneNumber,
            password: tempPassword, // Will be hashed by pre-save hook
            isEmailVerified: false,
            role: "user", // They are regular users, not companions
            gender: "others", // Default gender for companions
            isVerified: false,
            twoFactorEnabled: false,
            isBooked: false,
            profilePicture: [] // Empty array for profile pictures
          });

          await user.save();
        } catch (error: any) {
          // Handle duplicate email error
          if (error.code === 11000 && error.keyPattern?.email) {
            throw new Error(`A user with email "${companionData.email}" already exists. Please use a different email address for this companion.`);
          }
          // Re-throw other errors
          throw error;
        }

        // Send welcome email to new user
        try {
          await sendCompanionWelcomeEmail(
            {
              firstName: companionData.firstName,
              lastName: companionData.lastName,
              email: companionData.email,
              phoneNumber: companionData.phoneNumber
            } as any,
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
      } else {
        // Update existing user info if needed
        const needsUpdate = 
          user.firstName !== companionData.firstName ||
          user.lastName !== companionData.lastName ||
          user.phoneNumber !== companionData.phoneNumber;

        if (needsUpdate) {
          user.firstName = companionData.firstName;
          user.lastName = companionData.lastName;
          user.phoneNumber = companionData.phoneNumber;
          await user.save();
        }

        // Send notification email to existing user about being added to booking
        try {
          await sendCompanionWelcomeEmail(
            {
              firstName: companionData.firstName,
              lastName: companionData.lastName,
              email: companionData.email,
              phoneNumber: companionData.phoneNumber
            } as any,
            {
              packageName: primaryBooking.packageName,
              bookingId: primaryBooking.bookingId,
              travelDate: primaryBooking.travelDate,
              description: primaryBooking.description
            } as any,
            destination,
            null // No temp password for existing users
          );
        } catch (emailError) {
          console.error("Failed to send companion notification email:", emailError);
        }
      }

      // Create or update companion relationship record
      let companion = await CompanionModel.findOne({ 
        email: companionData.email,
        bookingId: primaryBooking._id
      });

      if (!companion) {
        // Create new companion relationship
        companion = new CompanionModel({
          firstName: companionData.firstName,
          lastName: companionData.lastName,
          email: companionData.email,
          phoneNumber: companionData.phoneNumber,
          relationship: companionData.relationship as any,
          userId: user._id,
          bookingId: primaryBooking._id,
          isRegistered: true // They are now registered users
        });
      } else {
        // Update existing companion relationship
        companion.firstName = companionData.firstName;
        companion.lastName = companionData.lastName;
        companion.phoneNumber = companionData.phoneNumber;
        companion.relationship = companionData.relationship as any;
        companion.isRegistered = true;
      }

      await companion.save();

      // Create companion booking (separate booking for the companion)
      const existingCompanionBooking = await UserBookingModel.findOne({
        userId: user._id,
        packageName: primaryBooking.packageName,
        isPrimary: false
      });

      if (!existingCompanionBooking) {
        const companionBooking = new UserBookingModel({
          packageName: primaryBooking.packageName, // Same package name as primary
          userId: user._id,
          destination: primaryBooking.destination,
          travelDate: primaryBooking.travelDate,
          returnDate: primaryBooking.returnDate,
          amount: primaryBooking.amount,
          description: primaryBooking.description,
          status: primaryBooking.status,
          documents: primaryBooking.documents,
          itineraries: primaryBooking.itineraries,
          isPrimary: false,
          bookingType: "companion",
          primaryBookingId: primaryBooking._id,
          companions: []
        });

        await companionBooking.save();
      }

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
        .populate("companions", "firstName lastName email phoneNumber")
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
      .populate("companions", "firstName lastName email phoneNumber relationship");
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
      .populate("companions", "firstName lastName email phoneNumber relationship");
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
      search,
      bookingType,
      isPrimary
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

    if (bookingType) {
      query.bookingType = bookingType;
    }

    if (isPrimary !== undefined) {
      query.isPrimary = isPrimary;
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      UserBookingModel.find(query)
        .populate("userId", "firstName lastName email")
        .populate("destination", "city country")
        .populate("companions", "firstName lastName email phoneNumber relationship")
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
      .populate("companions", "firstName lastName email phoneNumber relationship")
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
      .populate("companions", "firstName lastName email phoneNumber relationship");
  }
}
