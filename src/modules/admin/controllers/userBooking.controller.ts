import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { isAdmin } from "../../../types/typeGuards";
import { UserBookingService } from "../services/userBooking.service";
import { BookingStatus } from "../../../types/roles";

// Update user booking (admin only) - this can create a new booking or update existing one
export const updateUserBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;
    const updateData = req.body;

    // Validate required fields for new booking
    if (!updateData.destinationId && !updateData.travelDate && !updateData.returnDate && !updateData.amount && !updateData.description && !updateData.companions) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided for update"
      });
    }

    const user = await UserBookingService.updateUserBooking(userId, updateData);

    res.status(200).json({
      success: true,
      message: "User booking updated successfully",
      user
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Get user booking by ID (admin only) - returns user + all companions
export const getUserBookingById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;
    const result = await UserBookingService.getUserBookingById(userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User booking not found"
      });
    }

    res.status(200).json({
      success: true,
      user: result.user,
      companions: result.companions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Update user booking status (admin only)
export const updateUserBookingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    // Validate that status is a valid BookingStatus
    if (!Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + Object.values(BookingStatus).join(", ")
      });
    }

    const user = await UserBookingService.updateUserBookingStatus(userId, status as BookingStatus);

    res.status(200).json({
      success: true,
      message: "User booking status updated successfully",
      user
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Get all user bookings with pagination and filters (admin only)
export const getAllUserBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { page, limit, status, packageName, search } = req.query;

    const result = await UserBookingService.getAllUserBookings({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status: status as string,
      packageName: packageName as string,
      search: search as string
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};
