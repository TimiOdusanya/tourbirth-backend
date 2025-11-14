import mongoose, { Document, Schema } from "mongoose";
import { BookingStatus, Currency } from "../../../types/roles";

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

export interface IBooking extends Document {
  bookingId: string; // TB- prefixed unique ID
  packageName: string; // TB- prefixed package name
  userId: mongoose.Types.ObjectId; // Reference to the main user
  companions: mongoose.Types.ObjectId[]; // Array of companion IDs
  status: BookingStatus;
  destination: mongoose.Types.ObjectId; // Reference to destination
  travelDate: Date;
  returnDate: Date;
  bookingDate: Date;
  totalAmount: number; // Total amount for the booking
  bookingAmount: number; // Booking/deposit amount
  currency: Currency; // Currency type (Naira or USD)
  description: string;
  documents: IDocument[];
  itineraries: IItinerary[];
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

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    packageName: { 
      type: String, 
      required: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "Account", 
      required: true 
    },
    companions: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Companion" 
    }],
    status: { 
      type: String, 
      enum: Object.values(BookingStatus), 
      default: BookingStatus.PENDING 
    },
    destination: { 
      type: Schema.Types.ObjectId, 
      ref: "Destination", 
      required: true 
    },
    travelDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    bookingDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    bookingAmount: { type: Number, required: true },
    currency: { 
      type: String, 
      enum: Object.values(Currency), 
      required: true,
      default: Currency.NAIRA
    },
    description: { type: String, required: true },
    documents: [DocumentSchema],
    itineraries: [ItinerarySchema],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Generate unique booking ID and package name
BookingSchema.pre<IBooking>("save", async function(next) {
  if (this.isNew) {
    // Generate TB- prefixed booking ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingId = `TB-${timestamp}-${random}`.toUpperCase();
    
    // Generate TB- prefixed package name
    this.packageName = `TB-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema); 