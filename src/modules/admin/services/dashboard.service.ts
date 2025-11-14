import { BookingModel } from "../../shared/models/booking.model";
import { UserBookingModel } from "../../shared/models/userBooking.model";
import { UserModel } from "../../user/models/userProfile.model";
import { Role, BookingStatus, Currency } from "../../../types/roles";

export class DashboardService {
  // Get dashboard statistics - unified endpoint with optional currency filter
  static async getDashboardStats(currency?: Currency) {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    // If currency is specified, return stats for that currency only
    if (currency) {
      // Total bookings for this currency
      const totalBookings = await UserBookingModel.countDocuments({ 
        currency,
        isActive: true 
      });

      // Get all PAID bookings for this currency (all time)
      const paidBookings = await UserBookingModel.find({
        status: BookingStatus.PAID,
        currency,
        isActive: true
      });

      // Calculate revenue (total amount for all PAID bookings)
      const revenue = paidBookings.reduce((total, booking) => total + booking.totalAmount, 0);
      
      // Calculate total booking amount (deposits for all PAID bookings)
      const totalBookingsAmount = paidBookings.reduce((total, booking) => total + booking.bookingAmount, 0);
      
      // Calculate total profit (difference between totalAmount and bookingAmount for PAID bookings)
      const totalProfit = paidBookings.reduce((total, booking) => {
        return total + (booking.totalAmount - booking.bookingAmount);
      }, 0);

      // Upcoming tours for this currency
      const upcomingTours = await UserBookingModel.find({
        travelDate: { $gte: now, $lte: thirtyDaysFromNow },
        currency,
        isActive: true
      })
      .populate('userId', 'firstName surname email')
      .populate('destination', 'city country')
      .sort({ travelDate: 1 })
      .limit(10);

      // Total users
      const totalUsers = await UserModel.countDocuments({ role: Role.User });

      return {
        currency,
        totalBookings,
        revenue,
        totalBookingsAmount,
        totalProfit,
        upcomingTours: upcomingTours.length,
        totalUsers,
        upcomingToursDetails: upcomingTours
      };
    }

    // If no currency specified, return combined stats for both currencies
    // Total bookings (all currencies)
    const totalBookings = await UserBookingModel.countDocuments({ isActive: true });

    // Get all PAID bookings - separated by currency (all time)
    const paidBookingsNaira = await UserBookingModel.find({
      status: BookingStatus.PAID,
      currency: Currency.NAIRA,
      isActive: true
    });

    const paidBookingsUSD = await UserBookingModel.find({
      status: BookingStatus.PAID,
      currency: Currency.USD,
      isActive: true
    });

    // Calculate for Naira
    const revenueNaira = paidBookingsNaira.reduce((total, booking) => total + booking.totalAmount, 0);
    const totalBookingsAmountNaira = paidBookingsNaira.reduce((total, booking) => total + booking.bookingAmount, 0);
    const totalProfitNaira = paidBookingsNaira.reduce((total, booking) => {
      return total + (booking.totalAmount - booking.bookingAmount);
    }, 0);

    // Calculate for USD
    const revenueUSD = paidBookingsUSD.reduce((total, booking) => total + booking.totalAmount, 0);
    const totalBookingsAmountUSD = paidBookingsUSD.reduce((total, booking) => total + booking.bookingAmount, 0);
    const totalProfitUSD = paidBookingsUSD.reduce((total, booking) => {
      return total + (booking.totalAmount - booking.bookingAmount);
    }, 0);

    // Upcoming tours (all currencies)
    const upcomingTours = await UserBookingModel.find({
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
      revenue: {
        naira: revenueNaira,
        usd: revenueUSD
      },
      totalBookingsAmount: {
        naira: totalBookingsAmountNaira,
        usd: totalBookingsAmountUSD
      },
      totalProfit: {
        naira: totalProfitNaira,
        usd: totalProfitUSD
      },
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