// src/modules/user/models/userProfile.model.ts
import { Schema } from "mongoose";
import { Role, MaritalStatus, UserGender, BookingStatus } from "../../../types/roles";
import { AccountModel, IAccountBase } from "../../shared/models/account.model";

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

export interface IUser extends IAccountBase {
  gender: string;
  phoneNumber: string;
  dateOfBirth?: Date;
  maritalStatus?: MaritalStatus;
  anniversaryDate?: Date;
  address?: string;
  instagramUsername?: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  isBooked: boolean;
  // Booking related fields
  bookingId?: string;
  packageName?: string;
  status?: BookingStatus;
  destination?: Schema.Types.ObjectId;
  travelDate?: Date;
  returnDate?: Date;
  bookingDate?: Date;
  amount?: number;
  description?: string;
  documents?: IDocument[];
  itineraries?: IItinerary[];
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

const UserSchema = new Schema<IUser>({
  gender: { 
    type: String, 
    required: true,
    enum: Object.values(UserGender),
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  dateOfBirth: { 
    type: Date 
  },
  maritalStatus: { 
    type: String, 
    enum: Object.values(MaritalStatus) 
  },
  anniversaryDate: { 
    type: Date 
  },
  address: { 
    type: String 
  },
  instagramUsername: { 
    type: String 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isBooked:{
    type: Boolean,            
    default: false
  },
  twoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  twoFactorSecret: { 
    type: String, 
    default: "" 
  },
  // Booking related fields
  bookingId: { 
    type: String 
  },
  packageName: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: Object.values(BookingStatus) 
  },
  destination: { 
    type: Schema.Types.ObjectId, 
    ref: "Destination" 
  },
  travelDate: { 
    type: Date 
  },
  returnDate: { 
    type: Date 
  },
  bookingDate: { 
    type: Date 
  },
  amount: { 
    type: Number 
  },
  description: { 
    type: String 
  },
  documents: [DocumentSchema],
  itineraries: [ItinerarySchema]
});

export const UserModel = AccountModel.discriminator<IUser>(
  Role.User,
  UserSchema
);