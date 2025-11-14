import { sendEmail } from "./otpUtils";
import { ICompanion } from "../modules/shared/models/companion.model";
import { IBooking } from "../modules/shared/models/booking.model";
import { IDestination } from "../modules/shared/models/destination.model";

// Generate a temporary password for companions
export const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Send companion welcome email
export const sendCompanionWelcomeEmail = async (
  companion: ICompanion,
  booking: Partial<IBooking> | { packageName: string; bookingId: string; travelDate: Date; description: string },
  destination: IDestination,
  tempPassword: string | null
): Promise<void> => {
  const packageName = 'packageName' in booking ? booking.packageName : 'TB-Package';
  const bookingId = 'bookingId' in booking ? booking.bookingId : 'TB-Booking';
  const travelDate = 'travelDate' in booking ? booking.travelDate : new Date();
  const description = 'description' in booking ? booking.description : 'Trip details';

  await sendEmail(companion.email, 'companionWelcome', {
    subject: tempPassword ? 'Welcome to TourBirth - Trip Companion' : 'You\'ve been added to a TourBirth trip',
    companionName: `${companion.firstName} ${companion.lastName}`,
    packageName: packageName || 'TB-Package',
    bookingId: bookingId || 'TB-Booking',
    destination: `${destination.city}, ${destination.country}`,
    travelDate: travelDate ? new Date(travelDate).toLocaleDateString() : new Date().toLocaleDateString(),
    description: description || 'Trip details',
    email: companion.email,
    tempPassword: tempPassword || undefined, // Don't send tempPassword for existing users
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    isExistingUser: tempPassword === null // Flag to indicate if this is an existing user
  });
}; 