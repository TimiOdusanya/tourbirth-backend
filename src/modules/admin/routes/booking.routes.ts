import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  createBooking,
  addCompanionsToBooking,
  updateBookingStatus,
  getAllBookings,
  getBookingById
} from "../controllers/booking.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Booking management routes
router.post("/", createBooking);
router.post("/:bookingId/companions", addCompanionsToBooking);
router.put("/:bookingId/status", updateBookingStatus);
router.get("/", getAllBookings);
router.get("/:bookingId", getBookingById);

export default router; 