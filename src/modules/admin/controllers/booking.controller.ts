import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { isAdmin } from "../../../types/typeGuards";
import { BookingService } from "../services/booking.service";
import { BookingStatus } from "../../../types/roles";

// Create a new booking for a user
export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const {
      userId,
      destinationId,
      travelDate,
      returnDate,
      totalAmount,
      bookingAmount,
      currency,
      description,
      documents,
      itineraries,
      companions
    } = req.body;

    // Validate required fields
    if (!userId || !destinationId || !travelDate || !returnDate || !totalAmount || !bookingAmount || !currency || !description) {
      return res.status(400).json({
        success: false,
        message: "userId, destinationId, travelDate, returnDate, totalAmount, bookingAmount, currency, and description are required"
      });
    }

    const booking = await BookingService.createBooking({
      userId,
      destinationId,
      travelDate,
      returnDate,
      totalAmount,
      bookingAmount,
      currency,
      description,
      documents,
      itineraries,
      companions
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Get all bookings for a specific user
export const getUserBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await BookingService.getUserBookings(
      userId,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user bookings"
    });
  }
};

// Get user information and their bookings
export const getUserInfoAndBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;

    const result = await BookingService.getUserInfoAndBookings(userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: result.user,
      bookings: result.bookings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user information and bookings"
    });
  }
};

// Get booking by booking ID
export const getBookingById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId } = req.params;

    const booking = await BookingService.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booking"
    });
  }
};

// Update booking
export const updateBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId } = req.params;
    const {
      destinationId,
      travelDate,
      returnDate,
      totalAmount,
      bookingAmount,
      currency,
      description,
      status,
      documents,
      itineraries,
      companions
    } = req.body;

    const updatedBooking = await BookingService.updateBooking(bookingId, {
      destinationId,
      travelDate,
      returnDate,
      totalAmount,
      bookingAmount,
      currency,
      description,
      status,
      documents,
      itineraries,
      companions
    });

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update booking"
    });
  }
};

// Delete booking
export const deleteBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId } = req.params;

    const deleted = await BookingService.deleteBooking(bookingId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete booking"
    });
  }
};

// Get all bookings with filters (admin)
export const getAllBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      packageName,
      destinationId,
      search
    } = req.query;

    const result = await BookingService.getAllBookings({
      page: Number(page),
      limit: Number(limit),
      status: status as BookingStatus,
      packageName: packageName as string,
      destinationId: destinationId as string,
      search: search as string
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings"
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId } = req.params;
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

    const booking = await BookingService.updateBookingStatus(bookingId, status as BookingStatus);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update booking status"
    });
  }
};

// Remove companion from a booking
export const removeCompanionFromBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId, companionId } = req.params;

    if (!bookingId || !companionId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and Companion ID are required"
      });
    }

    const booking = await BookingService.removeCompanionFromBooking(bookingId, companionId);

    res.status(200).json({
      success: true,
      message: "Companion removed from booking successfully",
      booking
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Update companion's booking status
export const updateCompanionBookingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { companionId } = req.params;
    const { status } = req.body;

    if (!companionId) {
      return res.status(400).json({
        success: false,
        message: "Companion ID is required"
      });
    }

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

    const companion = await BookingService.updateCompanionBookingStatus(companionId, status as BookingStatus);

    res.status(200).json({
      success: true,
      message: "Companion booking status updated successfully",
      companion
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};
