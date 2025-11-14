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
router.get("/stats", getDashboardStats); // Returns combined stats (all) or currency-specific stats based on query param
router.get("/users", getAllUsers);

export default router; 