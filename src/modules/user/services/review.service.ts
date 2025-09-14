import { ReviewModel, IReview } from "../../shared/models/review.model";
import mongoose from "mongoose";

export interface CreateReviewData {
  fullName: string;
  review: string;
  rating: number;
  images?: Array<{
    name: string;
    size: number;
    type: string;
    link: string;
  }>;
}

export interface UpdateReviewData {
  fullName?: string;
  review?: string;
  rating?: number;
  images?: Array<{
    name: string;
    size: number;
    type: string;
    link: string;
  }>;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  rating?: number;
  isApproved?: boolean;
  search?: string;
}

export class ReviewService {
  // Create a new review
  static async createReview(userId: string, data: CreateReviewData): Promise<IReview> {
    const review = new ReviewModel({
      ...data,
      userId: new mongoose.Types.ObjectId(userId)
    });

    return await review.save();
  }

  // Get all reviews with filters and pagination (only approved and active)
  static async getAllReviews(filters: ReviewFilters = {}) {
    const {
      page = 1,
      limit = 10,
      rating,
      search
    } = filters;

    const query: any = { isActive: true, isApproved: true };

    if (rating) {
      query.rating = rating;
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

  // Get review by ID (only if approved and active)
  static async getReviewById(reviewId: string): Promise<IReview | null> {
    return await ReviewModel.findOne({ 
      _id: new mongoose.Types.ObjectId(reviewId), 
      isActive: true,
      isApproved: true
    })
      .populate("userId", "firstName lastName email");
  }

  // Get reviews by user ID (user can see all their reviews regardless of approval or active status)
  static async getReviewsByUserId(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      ReviewModel.find({ 
        userId: new mongoose.Types.ObjectId(userId)
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ReviewModel.countDocuments({ 
        userId: new mongoose.Types.ObjectId(userId)
      })
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

  // Update review
  static async updateReview(reviewId: string, userId: string, data: UpdateReviewData): Promise<IReview | null> {
    return await ReviewModel.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(reviewId), 
        userId: new mongoose.Types.ObjectId(userId)
      },
      data,
      { new: true, runValidators: true }
    )
      .populate("userId", "firstName lastName email");
  }

  // Delete review (soft delete)
  static async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const result = await ReviewModel.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(reviewId), 
        userId: new mongoose.Types.ObjectId(userId)
      },
      { isActive: false }
    );

    return !!result;
  }

  // Get review statistics
  static async getReviewStats() {
    const query: any = { isActive: true, isApproved: true };

    const stats = await ReviewModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating"
          }
        }
      },
      {
        $project: {
          totalReviews: 1,
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

    return stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
}
