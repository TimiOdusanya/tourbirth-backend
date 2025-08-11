import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  updateUserProfileByAdmin,
  updateOwnProfile,
  updateAdminProfile,
  getUserProfileById
} from "../controllers/userProfile.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// User profile management routes
router.put("/user/:userId", updateUserProfileByAdmin);
router.put("/own", updateOwnProfile);
router.put("/admin", updateAdminProfile);
router.get("/user/:userId", getUserProfileById);

export default router; 