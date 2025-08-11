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
  booking: IBooking,
  destination: IDestination,
  tempPassword: string
): Promise<void> => {
  await sendEmail(companion.email, 'companionWelcome', {
    subject: 'Welcome to TourBirth - Trip Companion',
    companionName: `${companion.firstName} ${companion.lastName}`,
    packageName: booking.packageName,
    bookingId: booking.bookingId,
    destination: `${destination.city}, ${destination.country}`,
    travelDate: new Date(booking.travelDate).toLocaleDateString(),
    description: booking.description,
    email: companion.email,
    tempPassword: tempPassword,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  });
}; 