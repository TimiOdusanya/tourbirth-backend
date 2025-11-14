import { Request, Response } from "express";
import { WaitlistService, CreateWaitlistData, WaitlistFilters } from "../services/waitlist.service";

export class WaitlistController {
  // Add someone to the waitlist (public endpoint)
  static async addToWaitlist(req: Request, res: Response) {
    try {
      const { name, email, phoneNumber, tripType, additionalInformation } = req.body;

      // Validate required fields
      if (!name || !email || !phoneNumber || !tripType) {
        return res.status(400).json({
          success: false,
          message: "Name, email, phone number, and trip type are required"
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

      const waitlistData: CreateWaitlistData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        tripType: tripType.trim(),
        additionalInformation: additionalInformation?.trim()
      };

      const waitlistEntry = await WaitlistService.addToWaitlist(waitlistData);

      res.status(201).json({
        success: true,
        message: "Successfully added to waitlist! We'll notify you when we have trips matching your interests.",
        data: {
          id: waitlistEntry._id,
          name: waitlistEntry.name,
          email: waitlistEntry.email,
          tripType: waitlistEntry.tripType
        }
      });
    } catch (error: any) {
      console.error("Error adding to waitlist:", error);
      
      if (error.message.includes("already on our waitlist")) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to add to waitlist. Please try again later."
      });
    }
  }

  // Get all waitlist entries (admin)
  static async getAllWaitlistEntries(req: Request, res: Response) {
    try {
      const filters: WaitlistFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        tripType: req.query.tripType as string,
        search: req.query.search as string,
        isActive: req.query.isActive !== 'false'
      };

      const result = await WaitlistService.getAllWaitlistEntries(filters);

      res.status(200).json({
        success: true,
        message: "Waitlist entries retrieved successfully",
        data: result
      });
    } catch (error: any) {
      console.error("Error getting waitlist entries:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve waitlist entries"
      });
    }
  }

  // Get waitlist entry by ID (admin)
  static async getWaitlistEntryById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const entry = await WaitlistService.getWaitlistEntryById(id);

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: "Waitlist entry not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Waitlist entry retrieved successfully",
        data: entry
      });
    } catch (error: any) {
      console.error("Error getting waitlist entry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve waitlist entry"
      });
    }
  }

  // Update waitlist entry (admin)
  static async updateWaitlistEntry(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const entry = await WaitlistService.updateWaitlistEntry(id, updateData);

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: "Waitlist entry not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Waitlist entry updated successfully",
        data: entry
      });
    } catch (error: any) {
      console.error("Error updating waitlist entry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update waitlist entry"
      });
    }
  }

  // Remove from waitlist (admin)
  static async removeFromWaitlist(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const success = await WaitlistService.removeFromWaitlist(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Waitlist entry not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Successfully removed from waitlist"
      });
    } catch (error: any) {
      console.error("Error removing from waitlist:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove from waitlist"
      });
    }
  }

  // Get waitlist statistics (admin)
  static async getWaitlistStats(req: Request, res: Response) {
    try {
      const stats = await WaitlistService.getWaitlistStats();

      res.status(200).json({
        success: true,
        message: "Waitlist statistics retrieved successfully",
        data: stats
      });
    } catch (error: any) {
      console.error("Error getting waitlist stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve waitlist statistics"
      });
    }
  }
}
