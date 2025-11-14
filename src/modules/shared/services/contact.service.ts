import { ContactModel, IContact } from "../models/contact.model";
import { sendEmail } from "../../../utils/otpUtils";

export interface CreateContactData {
  fullName: string;
  email: string;
  dreamDestination: string;
  travelDate: Date;
  story: string;
}

export interface ContactFilters {
  page?: number;
  limit?: number;
  dreamDestination?: string;
  search?: string;
  isActive?: boolean;
}

export class ContactService {
  static async submitContactForm(data: CreateContactData): Promise<IContact> {
    // Create new contact entry
    const contactEntry = new ContactModel({
      ...data,
      email: data.email.toLowerCase()
    });

    await contactEntry.save();

    // Send confirmation email to the person who submitted
    try {
      await sendEmail(data.email, 'contactConfirmation', {
        subject: 'Thank you for contacting TourBirth! 🌟',
        fullName: data.fullName,
        email: data.email,
        dreamDestination: data.dreamDestination,
        travelDate: data.travelDate,
        story: data.story,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
      });
    } catch (emailError) {
      console.error("Failed to send contact confirmation email:", emailError);
    }

    // Send notification email to admin
    try {
      await sendEmail('timmycruz36@gmail.com', 'contactNotification', {
        subject: 'New Contact Form Submission - TourBirth',
        fullName: data.fullName,
        email: data.email,
        dreamDestination: data.dreamDestination,
        travelDate: data.travelDate,
        story: data.story,
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    return contactEntry;
  }

  // Get all contact entries (admin)
  static async getAllContactEntries(filters: ContactFilters = {}) {
    const {
      page = 1,
      limit = 10,
      dreamDestination,
      search,
      isActive = true
    } = filters;

    const query: any = { isActive };

    if (dreamDestination) {
      query.dreamDestination = { $regex: dreamDestination, $options: "i" };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { dreamDestination: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      ContactModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactModel.countDocuments(query)
    ]);

    return {
      entries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  // Get contact entry by ID (admin)
  static async getContactEntryById(id: string): Promise<IContact | null> {
    return await ContactModel.findById(id);
  }

  // Update contact entry (admin)
  static async updateContactEntry(id: string, updateData: Partial<CreateContactData>): Promise<IContact | null> {
    return await ContactModel.findByIdAndUpdate(
      id,
      { ...updateData, email: updateData.email?.toLowerCase() },
      { new: true, runValidators: true }
    );
  }

  // Remove contact entry (soft delete)
  static async removeContactEntry(id: string): Promise<boolean> {
    const result = await ContactModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }
}
