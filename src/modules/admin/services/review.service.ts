import { ReviewModel, IReview } from "../../shared/models/review.model";
import mongoose from "mongoose";

export interface AdminReviewFilters {
  page?: number;
  limit?: number;
  rating?: number;
  isApproved?: boolean;
  isActive?: boolean;
  search?: string;
}

export class AdminReviewService {
  // Get all reviews for admin (including unapproved and inactive)
  static async getAllReviewsForAdmin(filters: AdminReviewFilters = {}) {
    const {
      page = 1,
      limit = 10,
      rating,
      isApproved,
      isActive,
      search
    } = filters;

    const query: any = {};

    if (rating) {
      query.rating = rating;
    }

    if (isApproved !== undefined) {
      query.isApproved = isApproved;
    }

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { review: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      ReviewModel.find(query)
        .populate("userId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewModel.countDocuments(query)
    ]);

    return {
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Approve review
  static async approveReview(reviewId: string): Promise<IReview | null> {
    return await ReviewModel.findByIdAndUpdate(
      reviewId,
      { isApproved: true },
      { new: true }
    )
      .populate("userId", "firstName lastName email");
  }

  // Reject review
  static async rejectReview(reviewId: string): Promise<IReview | null> {
    return await ReviewModel.findByIdAndUpdate(
      reviewId,
      { isApproved: false },
      { new: true }
    )
      .populate("userId", "firstName lastName email");
  }

  // Toggle review active status
  static async toggleReviewActiveStatus(reviewId: string): Promise<IReview | null> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) return null;

    return await ReviewModel.findByIdAndUpdate(
      reviewId,
      { isActive: !review.isActive },
      { new: true }
    )
      .populate("userId", "firstName lastName email");
  }

  // Delete review (admin only - hard delete)
  static async deleteReview(reviewId: string): Promise<boolean> {
    const result = await ReviewModel.findByIdAndDelete(reviewId);
    return !!result;
  }

  // Get review statistics for admin
  static async getReviewStatsForAdmin() {
    const [totalReviews, approvedReviews, pendingReviews, activeReviews, inactiveReviews] = await Promise.all([
      ReviewModel.countDocuments({}),
      ReviewModel.countDocuments({ isApproved: true }),
      ReviewModel.countDocuments({ isApproved: false }),
      ReviewModel.countDocuments({ isActive: true }),
      ReviewModel.countDocuments({ isActive: false })
    ]);

    const ratingStats = await ReviewModel.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating"
          }
        }
      },
      {
        $project: {
          averageRating: { $round: ["$averageRating", 2] },
          ratingDistribution: {
            $reduce: {
              input: [1, 2, 3, 4, 5],
              initialValue: {},
              in: {
                $mergeObjects: [
                  "$$value",
                  {
                    $arrayToObject: [
                      [{
                        k: { $toString: "$$this" },
                        v: {
                          $size: {
                            $filter: {
                              input: "$ratingDistribution",
                              cond: { $eq: ["$$item", "$$this"] }
                            }
                          }
                        }
                      }]
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    return {
      totalReviews,
      approvedReviews,
      pendingReviews,
      activeReviews,
      inactiveReviews,
      ...(ratingStats[0] || {
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      })
    };
  }
}
