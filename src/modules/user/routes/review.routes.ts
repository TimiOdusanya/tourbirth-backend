import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  createReview,
  getAllReviews,
  getReviewById,
  getMyReviews,
  updateReview,
  deleteReview,
  getReviewStats
} from "../controllers/review.controller";

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllReviews); // Get all approved reviews
router.get("/stats", getReviewStats); // Get review statistics
router.get("/:reviewId", getReviewById); // Get specific review by ID

// Protected routes (authentication required)
router.use(authenticate); // Apply auth middleware to all routes below

router.post("/", createReview); // Create new review
router.get("/my-reviews", getMyReviews); // Get user's own reviews
router.patch("/:reviewId", updateReview); // Update user's review
router.delete("/:reviewId", deleteReview); // Delete user's review

export default router;
