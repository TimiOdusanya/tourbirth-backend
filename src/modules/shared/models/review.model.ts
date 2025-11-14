import mongoose, { Document, Schema } from "mongoose";

export interface IReviewImage {
  name: string;
  size: number;
  type: string;
  link: string;
}

export interface IReview extends Document {
  fullName: string;
  review: string;
  rating: number; // 1-5 scale
  images: IReviewImage[];
  userId: mongoose.Types.ObjectId; // Reference to the user who created the review
  isActive: boolean; // Admin can toggle this
  isApproved: boolean; // Admin approval required
}

const ReviewImageSchema = new Schema<IReviewImage>({
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  link: { type: String, required: true }
});

const ReviewSchema = new Schema<IReview>(
  {
    fullName: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 100
    },
    review: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 1000
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5
    },
    images: [ReviewImageSchema],
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "Account", 
      required: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    isApproved: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Index for better query performance
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isApproved: 1, isActive: 1 });

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
