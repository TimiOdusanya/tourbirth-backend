import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  updateUserBooking,
  getUserBookingById,
  updateUserBookingStatus,
  getAllUserBookings
} from "../controllers/userBooking.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// User booking management routes
router.patch("/:userId", updateUserBooking);
router.get("/", getAllUserBookings);
router.get("/:userId", getUserBookingById);
router.patch("/:userId/status", updateUserBookingStatus);

export default router;
