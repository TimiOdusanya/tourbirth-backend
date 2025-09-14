import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { isAdmin } from "../../../types/typeGuards";
import { AdminReviewService } from "../services/review.service";

// Get all reviews for admin (including unapproved and inactive)
export const getAllReviewsForAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const {
      page = 1,
      limit = 10,
      rating,
      isApproved,
      isActive,
      search
    } = req.query;

    const result = await AdminReviewService.getAllReviewsForAdmin({
      page: Number(page),
      limit: Number(limit),
      rating: rating ? Number(rating) : undefined,
      isApproved: isApproved !== undefined ? isApproved === "true" : undefined,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      search: search as string
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews"
    });
  }
};

// Approve review
export const approveReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { reviewId } = req.params;

    const review = await AdminReviewService.approveReview(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review approved successfully",
      review
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve review"
    });
  }
};

// Reject review
export const rejectReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { reviewId } = req.params;

    const review = await AdminReviewService.rejectReview(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      review
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reject review"
    });
  }
};

// Toggle review active status
export const toggleReviewActiveStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { reviewId } = req.params;

    const review = await AdminReviewService.toggleReviewActiveStatus(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Review ${review.isActive ? 'activated' : 'deactivated'} successfully`,
      review
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle review status"
    });
  }
};

// Delete review (admin only - hard delete)
export const deleteReviewAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { reviewId } = req.params;

    const deleted = await AdminReviewService.deleteReview(reviewId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete review"
    });
  }
};

// Get review statistics for admin
export const getReviewStatsAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const stats = await AdminReviewService.getReviewStatsForAdmin();

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch review statistics"
    });
  }
};
