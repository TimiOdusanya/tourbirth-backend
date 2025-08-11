import { BookingModel } from "../../shared/models/booking.model";
import { UserModel } from "../../user/models/userProfile.model";
import { Role, BookingStatus } from "../../../types/roles";

export class DashboardService {
  // Get dashboard statistics
  static async getDashboardStats() {
    // Get current date and start of month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total bookings
    const totalBookings = await BookingModel.countDocuments({ isActive: true });

    // Revenue this month
    const monthlyBookings = await BookingModel.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      status: BookingStatus.PAID,
      isActive: true
    });

    const revenueThisMonth = monthlyBookings.reduce((total, booking) => total + booking.amount, 0);

    // Upcoming tours (tours scheduled to happen soon - within next 30 days)
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    const upcomingTours = await BookingModel.find({
      travelDate: { $gte: now, $lte: thirtyDaysFromNow },
      isActive: true
    })
    .populate('userId', 'firstName surname email')
    .populate('destination', 'city country')
    .sort({ travelDate: 1 })
    .limit(10);

    // Total users
    const totalUsers = await UserModel.countDocuments({ role: Role.User });

    return {
      totalBookings,
      revenueThisMonth,
      upcomingTours: upcomingTours.length,
      totalUsers,
      upcomingToursDetails: upcomingTours
    };
  }

  // Get all users with pagination and search
  static async getAllUsers(filters: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { page = 1, limit = 10, search } = filters;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter object
    const filter: any = { role: Role.User };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { surname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await UserModel.find(filter)
      .select('-password -verificationOTP -resetPasswordOTP')
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