import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  updateUserProfileByAdmin,
  updateOwnProfile,
  updateAdminProfile,
  getUserProfileById,
  addCompanionsToUser,
  getUserCompanions,
  updateCompanion,
  updateUserStatus,
  getAllUsers
} from "../controllers/userProfile.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// User profile management routes
router.put("/user/:userId", updateUserProfileByAdmin);
router.put("/own", updateOwnProfile);
router.put("/admin", updateAdminProfile);
router.get("/user/:userId", getUserProfileById);

// Companion management routes
router.post("/user/:userId/companions", addCompanionsToUser);
router.get("/user/:userId/companions", getUserCompanions);
router.put("/companion/:companionId", updateCompanion);

// User status management
router.patch("/user/:userId/status", updateUserStatus);

// Get all users with pagination and filters
router.get("/users", getAllUsers);

export default router; 