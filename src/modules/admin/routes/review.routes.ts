import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  getAllReviewsForAdmin,
  approveReview,
  rejectReview,
  toggleReviewActiveStatus,
  deleteReviewAdmin,
  getReviewStatsAdmin
} from "../controllers/review.controller";

const router = express.Router();

// All admin review routes require authentication
router.use(authenticate);

// Get all reviews for admin management
router.get("/", getAllReviewsForAdmin);

// Get review statistics for admin dashboard
router.get("/stats", getReviewStatsAdmin);

// Approve a review
router.patch("/:reviewId/approve", approveReview);

// Reject a review
router.patch("/:reviewId/reject", rejectReview);

// Toggle review active status
router.patch("/:reviewId/toggle-active", toggleReviewActiveStatus);

// Delete a review (admin only - hard delete)
router.delete("/:reviewId", deleteReviewAdmin);

export default router;
