import { NewsletterModel, INewsletter } from "../models/newsletter.model";
import { sendEmail } from "../../../utils/otpUtils";

export interface NewsletterSubscriptionData {
  email: string;
}

export interface NewsletterFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export class NewsletterService {
  static async subscribeToNewsletter(data: NewsletterSubscriptionData): Promise<INewsletter> {
    const existingSubscription = await NewsletterModel.findOne({ 
      email: data.email.toLowerCase(),
      isActive: true 
    });

    if (existingSubscription) {
      throw new Error("This email is already subscribed to our newsletter!");
    }

    const newsletterSubscription = new NewsletterModel({
      email: data.email.toLowerCase()
    });

    await newsletterSubscription.save();

    try {
      await sendEmail(data.email, 'newsletterConfirmation', {
        subject: 'Welcome to TourBirth Newsletter! 📧',
        email: data.email,
        frontendUrl: process.env.FRONTEND_URL || 'https://tourbirth.com'
      });
    } catch (emailError) {
      console.error("Failed to send newsletter confirmation email:", emailError);
    }

    try {
      await sendEmail('timmycruz36@gmail.com', 'newsletterNotification', {
        subject: 'New Newsletter Subscription - TourBirth',
        email: data.email,
        frontendUrl: process.env.FRONTEND_URL || 'https://tourbirth.com'
      });
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    return newsletterSubscription;
  }

  static async getAllSubscriptions(filters: NewsletterFilters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive = true
    } = filters;

    const query: any = { isActive };

    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      NewsletterModel.find(query)
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewsletterModel.countDocuments(query)
    ]);

    return {
      subscriptions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSubscriptions: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  static async getSubscriptionById(id: string): Promise<INewsletter | null> {
    return await NewsletterModel.findById(id);
  }

  static async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    const result = await NewsletterModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        isActive: false,
        unsubscribedAt: new Date()
      },
      { new: true }
    );
    return !!result;
  }

  static async getNewsletterStats() {
    const total = await NewsletterModel.countDocuments({ isActive: true });
    
    const recentSubscriptions = await NewsletterModel.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .limit(5)
      .select('email subscribedAt')
      .lean();

    return {
      total,
      recentSubscriptions
    };
  }
}
