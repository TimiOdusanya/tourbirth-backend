import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../../../middleware/authMiddleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// User profile management routes
router.patch("/profile", UserController.updateUserProfile);
router.put("/profile/picture", UserController.updateProfilePicture);
router.get("/profile", UserController.getUserProfile);

// User booking routes
router.get("/bookings", UserController.getUserBookings);
router.get("/bookings/stats", UserController.getUserBookingStats);
router.get("/bookings/:bookingId", UserController.getUserBookingById);
router.get("/bookings/debug/all", UserController.debugUserBookings);

export default router;
