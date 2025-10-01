import { Request, Response } from "express";
import { NewsletterService, NewsletterSubscriptionData, NewsletterFilters } from "../services/newsletter.service";

export class NewsletterController {
  static async subscribeToNewsletter(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

      const subscriptionData: NewsletterSubscriptionData = {
        email: email.trim().toLowerCase()
      };

      const subscription = await NewsletterService.subscribeToNewsletter(subscriptionData);

      res.status(201).json({
        success: true,
        message: "Successfully subscribed to newsletter! You'll receive updates about our latest trips and offers.",
        data: {
          id: subscription._id,
          email: subscription.email
        }
      });
    } catch (error: any) {
      console.error("Error subscribing to newsletter:", error);
      
      if (error.message.includes("already subscribed")) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to subscribe to newsletter. Please try again later."
      });
    }
  }

  static async getAllSubscriptions(req: Request, res: Response) {
    try {
      const filters: NewsletterFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        isActive: req.query.isActive !== 'false'
      };

      const result = await NewsletterService.getAllSubscriptions(filters);

      res.status(200).json({
        success: true,
        message: "Newsletter subscriptions retrieved successfully",
        data: result
      });
    } catch (error: any) {
      console.error("Error getting newsletter subscriptions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve newsletter subscriptions"
      });
    }
  }

  static async getSubscriptionById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const subscription = await NewsletterService.getSubscriptionById(id);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Newsletter subscription not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Newsletter subscription retrieved successfully",
        data: subscription
      });
    } catch (error: any) {
      console.error("Error getting newsletter subscription:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve newsletter subscription"
      });
    }
  }

  static async unsubscribeFromNewsletter(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }

      const success = await NewsletterService.unsubscribeFromNewsletter(email);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Newsletter subscription not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Successfully unsubscribed from newsletter"
      });
    } catch (error: any) {
      console.error("Error unsubscribing from newsletter:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unsubscribe from newsletter"
      });
    }
  }

  static async getNewsletterStats(req: Request, res: Response) {
    try {
      const stats = await NewsletterService.getNewsletterStats();

      res.status(200).json({
        success: true,
        message: "Newsletter statistics retrieved successfully",
        data: stats
      });
    } catch (error: any) {
      console.error("Error getting newsletter stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve newsletter statistics"
      });
    }
  }
}
