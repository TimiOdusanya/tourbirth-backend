import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { ReviewService } from "../services/review.service";

// Create a new review
export const createReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { fullName, review, rating, images } = req.body;

    // Validate required fields
    if (!fullName || !review || !rating) {
      return res.status(400).json({
        success: false,
        message: "Full name, review, and rating are required"
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const reviewData = await ReviewService.createReview(req.user._id, {
      fullName,
      review,
      rating,
      images
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review: reviewData
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create review"
    });
  }
};

// Get all reviews with filters
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      rating,
      search
    } = req.query;

    const result = await ReviewService.getAllReviews({
      page: Number(page),
      limit: Number(limit),
      rating: rating ? Number(rating) : undefined,
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

// Get review by ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const review = await ReviewService.getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      review
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch review"
    });
  }
};

// Get user's own reviews
export const getMyReviews = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { page = 1, limit = 10 } = req.query;

    const result = await ReviewService.getReviewsByUserId(
      req.user._id,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your reviews"
    });
  }
};

// Update review
export const updateReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { reviewId } = req.params;
    const { fullName, review, rating, images } = req.body;

    // Validate rating range if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const updatedReview = await ReviewService.updateReview(reviewId, req.user._id, {
      fullName,
      review,
      rating,
      images
    });

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to update it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update review"
    });
  }
};

// Delete review
export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { reviewId } = req.params;

    const deleted = await ReviewService.deleteReview(reviewId, req.user._id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to delete it"
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

// Get review statistics
export const getReviewStats = async (req: Request, res: Response) => {
  try {
    const stats = await ReviewService.getReviewStats();

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
