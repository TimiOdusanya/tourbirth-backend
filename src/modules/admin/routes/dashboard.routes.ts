import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  getDashboardStats,
  getAllUsers
} from "../controllers/dashboard.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Dashboard routes
router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);

export default router; 