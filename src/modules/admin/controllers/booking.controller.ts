import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { isAdmin } from "../../../types/typeGuards";
import { BookingService } from "../services/booking.service";

// Create a new booking
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
      amount,
      description,
      companions
    } = req.body;

    // Validate required fields
    if (!userId || !destinationId || !travelDate || !returnDate || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const booking = await BookingService.createBooking({
      userId,
      destinationId,
      travelDate,
      returnDate,
      amount,
      description,
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

// Add companions to existing booking
export const addCompanionsToBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId } = req.params;
    const { companions } = req.body;

    if (!companions || !Array.isArray(companions) || companions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Companions array is required"
      });
    }

    const booking = await BookingService.addCompanionsToBooking(bookingId, { companions });

    res.status(200).json({
      success: true,
      message: "Companions added successfully",
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

    const booking = await BookingService.updateBookingStatus(bookingId, status);

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
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

// Get all bookings with pagination and filters
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
      search
    } = req.query;

    const result = await BookingService.getAllBookings({
      page: Number(page),
      limit: Number(limit),
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

// Get booking by ID
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
      message: error.message || "Internal server error"
    });
  }
}; 