import mongoose, { Document, Schema } from "mongoose";
import { BookingStatus } from "../../../types/roles";

export interface IDocument {
  name: string;
  size: number;
  type: string;
  link: string;
}

export interface IItinerary {
  name: string;
  size: number;
  type: string;
  link: string;
}

export interface IUserBooking extends Document {
  bookingId: string; // Unique booking ID for this specific booking
  packageName: string; // Shared package name for primary user and companions
  userId: mongoose.Types.ObjectId; // Reference to the user who owns this booking
  destination: mongoose.Types.ObjectId; // Reference to destination
  travelDate: Date;
  returnDate: Date;
  bookingDate: Date;
  amount: number;
  description: string;
  status: BookingStatus;
  documents: IDocument[];
  itineraries: IItinerary[];
  companions: mongoose.Types.ObjectId[]; // Array of companion IDs
  isPrimary: boolean; // true for primary user, false for companions
  isActive: boolean;
}

const DocumentSchema = new Schema<IDocument>({
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  link: { type: String, required: true }
});

const ItinerarySchema = new Schema<IItinerary>({
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  link: { type: String, required: true }
});

const UserBookingSchema = new Schema<IUserBooking>(
  {
    bookingId: { 
      type: String, 
      unique: true 
    },
    packageName: { 
      type: String
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "user", 
      required: true 
    },
    destination: { 
      type: Schema.Types.ObjectId, 
      ref: "Destination", 
      required: true 
    },
    travelDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    bookingDate: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: Object.values(BookingStatus), 
      default: BookingStatus.PENDING 
    },
    documents: [DocumentSchema],
    itineraries: [ItinerarySchema],
    companions: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Companion" 
    }],
    isPrimary: { 
      type: Boolean, 
      default: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Generate unique booking ID and package name
UserBookingSchema.pre<IUserBooking>("save", async function(next) {
  if (this.isNew) {
    // Generate unique booking ID for this specific booking
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingId = `ID-${timestamp}-${random}`.toUpperCase();
    
    // Generate package name for primary bookings only
    // Companion bookings should already have packageName set from the primary booking
    if (this.isPrimary && !this.packageName) {
      this.packageName = `TB-${timestamp}-${random}`.toUpperCase();
    }
  }
  next();
});

// Index for better query performance
UserBookingSchema.index({ userId: 1 });
UserBookingSchema.index({ bookingId: 1 });
UserBookingSchema.index({ packageName: 1 });
UserBookingSchema.index({ destination: 1 });
UserBookingSchema.index({ status: 1 });
UserBookingSchema.index({ isPrimary: 1 });
UserBookingSchema.index({ isActive: 1 });

export const UserBookingModel = mongoose.model<IUserBooking>("UserBooking", UserBookingSchema);
