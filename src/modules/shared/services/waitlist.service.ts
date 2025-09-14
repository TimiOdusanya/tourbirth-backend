import { WaitlistModel, IWaitlist } from "../models/waitlist.model";
import { sendEmail } from "../../../utils/otpUtils";

export interface CreateWaitlistData {
  name: string;
  email: string;
  phoneNumber: string;
  tripType: string;
  additionalInformation?: string;
}

export interface WaitlistFilters {
  page?: number;
  limit?: number;
  tripType?: string;
  search?: string;
  isActive?: boolean;
}

export class WaitlistService {
  // Add someone to the waitlist
  static async addToWaitlist(data: CreateWaitlistData): Promise<IWaitlist> {
    // Check if email already exists in waitlist
    const existingEntry = await WaitlistModel.findOne({ 
      email: data.email.toLowerCase(),
      isActive: true 
    });

    if (existingEntry) {
      throw new Error("This email is already on our waitlist!");
    }

    // Create new waitlist entry
    const waitlistEntry = new WaitlistModel({
      ...data,
      email: data.email.toLowerCase()
    });

    await waitlistEntry.save();

    // Send confirmation email to the person who joined
    try {
      await sendEmail(data.email, 'waitlistConfirmation', {
        subject: 'Welcome to TourBirth Waitlist! 🎉',
        name: data.name,
        email: data.email,
        tripType: data.tripType,
        additionalInformation: data.additionalInformation,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
      });
    } catch (emailError) {
      console.error("Failed to send waitlist confirmation email:", emailError);
      // Don't throw error - waitlist entry was created successfully
    }

    // Send notification email to admin
    try {
      await sendEmail('timmycruz36@gmail.com', 'waitlistNotification', {
        subject: 'New Waitlist Entry - TourBirth',
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        tripType: data.tripType,
        additionalInformation: data.additionalInformation,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      // Don't throw error - waitlist entry was created successfully
    }

    return waitlistEntry;
  }

  // Get all waitlist entries (admin)
  static async getAllWaitlistEntries(filters: WaitlistFilters = {}) {
    const {
      page = 1,
      limit = 10,
      tripType,
      search,
      isActive = true
    } = filters;

    const query: any = { isActive };

    if (tripType) {
      query.tripType = { $regex: tripType, $options: "i" };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { tripType: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      WaitlistModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WaitlistModel.countDocuments(query)
    ]);

    return {
      entries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Get waitlist entry by ID (admin)
  static async getWaitlistEntryById(id: string): Promise<IWaitlist | null> {
    return await WaitlistModel.findById(id);
  }

  // Update waitlist entry (admin)
  static async updateWaitlistEntry(id: string, updateData: Partial<CreateWaitlistData>): Promise<IWaitlist | null> {
    return await WaitlistModel.findByIdAndUpdate(
      id,
      { ...updateData, email: updateData.email?.toLowerCase() },
      { new: true, runValidators: true }
    );
  }

  // Remove from waitlist (soft delete)
  static async removeFromWaitlist(id: string): Promise<boolean> {
    const result = await WaitlistModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  // Get waitlist statistics (admin)
  static async getWaitlistStats() {
    const total = await WaitlistModel.countDocuments({ isActive: true });
    
    const tripTypeStats = await WaitlistModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$tripType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentEntries = await WaitlistModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email tripType createdAt')
      .lean();

    return {
      total,
      tripTypeStats,
      recentEntries
    };
  }
}
