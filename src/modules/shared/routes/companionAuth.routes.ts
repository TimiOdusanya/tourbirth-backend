import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  login,
  updateProfile,
  getProfile,
  changePassword
} from "../controllers/companionAuth.controller";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", login);

// Protected routes (authentication required)
router.use(authenticate);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/change-password", changePassword);

export default router; 