import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  createBooking,
  getUserBookings,
  getUserInfoAndBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAllBookings,
  updateBookingStatus,
  removeCompanionFromBooking,
  updateCompanionBookingStatus
} from "../controllers/booking.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Booking management routes
router.post("/", createBooking);
router.get("/", getAllBookings);
router.get("/user/:userId", getUserBookings);
router.get("/user/:userId/info", getUserInfoAndBookings);
router.get("/:bookingId", getBookingById);
router.patch("/:bookingId", updateBooking);
router.patch("/:bookingId/status", updateBookingStatus);
router.delete("/:bookingId", deleteBooking);
router.delete("/:bookingId/companion/:companionId", removeCompanionFromBooking);
router.patch("/companion/:companionId/status", updateCompanionBookingStatus);

export default router;
