import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import { updateOwnProfile } from "../../admin/controllers/userProfile.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// User profile management routes
router.put("/", updateOwnProfile);

export default router; 