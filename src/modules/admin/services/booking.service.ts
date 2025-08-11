import mongoose from "mongoose";
import { BookingModel, IBooking } from "../../shared/models/booking.model";
import { CompanionModel, ICompanion } from "../../shared/models/companion.model";
import { UserModel } from "../../user/models/userProfile.model";
import { DestinationModel, IDestination } from "../../shared/models/destination.model";
import { generateTempPassword, sendCompanionWelcomeEmail } from "../../../utils/companionUtils";
import { BookingStatus } from "../../../types/roles";

export interface CreateBookingData {
  userId: string;
  destinationId: string;
  travelDate: Date;
  returnDate: Date;
  amount: number;
  description: string;
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

export class BookingService {
  // Create a new booking
  static async createBooking(bookingData: CreateBookingData): Promise<IBooking> {
    // Check if user exists
    const user = await UserModel.findById(bookingData.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if destination exists
    const destination = await DestinationModel.findById(bookingData.destinationId);
    if (!destination) {
      throw new Error("Destination not found");
    }

    // Create the booking
    const booking = new BookingModel({
      userId: bookingData.userId,
      destination: bookingData.destinationId,
      travelDate: new Date(bookingData.travelDate),
      returnDate: new Date(bookingData.returnDate),
      amount: bookingData.amount,
      description: bookingData.description
    });

    await booking.save();

    // Handle companions if provided
    if (bookingData.companions && bookingData.companions.length > 0) {
      const companionIds = await this.createCompanions(bookingData.companions, bookingData.userId, booking, destination);
      
      // Update booking with companion IDs
      booking.companions = companionIds as mongoose.Types.ObjectId[];
      await booking.save();
    }

    return booking;
  }

  // Add companions to existing booking
  static async addCompanionsToBooking(bookingId: string, companionsData: AddCompanionsData): Promise<IBooking> {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const destination = await DestinationModel.findById(booking.destination);
    if (!destination) {
      throw new Error("Destination not found");
    }

    const companionIds = await this.createCompanions(companionsData.companions, booking.userId.toString(), booking, destination);

    // Add new companions to existing booking
    booking.companions.push(...companionIds as mongoose.Types.ObjectId[]);
    await booking.save();

    return booking;
  }

  // Create companions and send welcome emails
  private static async createCompanions(
    companionsData: Array<{
      firstName: string;
      lastName: string;
      relationship: string;
      email: string;
      phoneNumber: string;
    }>,
    userId: string,
    booking: IBooking,
    destination: IDestination
  ): Promise<mongoose.Types.ObjectId[]> {
    const companionIds: mongoose.Types.ObjectId[] = [];
    
    for (const companionData of companionsData) {
      const tempPassword = generateTempPassword();
      
      const companion = new CompanionModel({
        ...companionData,
        userId,
        tempPassword,
        isRegistered: false
      });

      await companion.save();
      companionIds.push(companion._id as mongoose.Types.ObjectId);

      // Send welcome email to companion
      try {
        await sendCompanionWelcomeEmail(
          companion,
          booking,
          destination,
          tempPassword
        );
      } catch (emailError) {
        console.error("Failed to send companion email:", emailError);
      }
    }

    return companionIds;
  }

  // Update booking status
  static async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<IBooking> {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    booking.status = status;
    return await booking.save();
  }

  // Get all bookings with pagination and filters
  static async getAllBookings(filters: {
    page?: number;
    limit?: number;
    status?: string;
    packageName?: string;
    search?: string;
  }) {
    const { page = 1, limit = 10, status, packageName, search } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter object
    const filter: any = { isActive: true };
    
    if (status) filter.status = status;
    if (packageName) filter.packageName = { $regex: packageName, $options: 'i' };
    if (search) {
      filter.$or = [
        { packageName: { $regex: search, $options: 'i' } },
        { bookingId: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await BookingModel.find(filter)
      .populate('userId', 'firstName surname email')
      .populate('destination', 'city country')
      .populate('companions', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await BookingModel.countDocuments(filter);

    return {
      bookings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    };
  }

  // Get booking by ID
  static async getBookingById(bookingId: string): Promise<IBooking | null> {
    return await BookingModel.findById(bookingId)
      .populate('userId', 'firstName surname email phoneNumber')
      .populate('destination', 'city country')
      .populate('companions', 'firstName lastName email phoneNumber relationship');
  }
} 