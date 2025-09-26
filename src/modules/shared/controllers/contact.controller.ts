import { Request, Response } from "express";
import { ContactService, CreateContactData, ContactFilters } from "../services/contact.service";

export class ContactController {
  // Submit contact form (public endpoint)
  static async submitContactForm(req: Request, res: Response) {
    try {
      const { fullName, email, dreamDestination, travelDate, story } = req.body;

      // Validate required fields
      if (!fullName || !email || !dreamDestination || !travelDate || !story) {
        return res.status(400).json({
          success: false,
          message: "All fields are required: fullName, email, dreamDestination, travelDate, and story"
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

      // Validate travel date is in the future
      const travelDateObj = new Date(travelDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (travelDateObj < today) {
        return res.status(400).json({
          success: false,
          message: "Travel date must be in the future"
        });
      }

      const contactData: CreateContactData = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        dreamDestination: dreamDestination.trim(),
        travelDate: travelDateObj,
        story: story.trim()
      };

      const contactEntry = await ContactService.submitContactForm(contactData);

      res.status(201).json({
        success: true,
        message: "Thank you for contacting us! We'll get back to you soon about your dream destination.",
        data: {
          id: contactEntry._id,
          fullName: contactEntry.fullName,
          email: contactEntry.email,
          dreamDestination: contactEntry.dreamDestination
        }
      });
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      
      res.status(500).json({
        success: false,
        message: "Failed to submit contact form. Please try again later."
      });
    }
  }

  // Get all contact entries (admin)
  static async getAllContactEntries(req: Request, res: Response) {
    try {
      const filters: ContactFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        dreamDestination: req.query.dreamDestination as string,
        search: req.query.search as string,
        isActive: req.query.isActive !== 'false'
      };

      const result = await ContactService.getAllContactEntries(filters);

      res.status(200).json({
        success: true,
        message: "Contact entries retrieved successfully",
        data: result
      });
    } catch (error: any) {
      console.error("Error getting contact entries:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve contact entries"
      });
    }
  }

  // Get contact entry by ID (admin)
  static async getContactEntryById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const entry = await ContactService.getContactEntryById(id);

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: "Contact entry not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Contact entry retrieved successfully",
        data: entry
      });
    } catch (error: any) {
      console.error("Error getting contact entry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve contact entry"
      });
    }
  }

  // Update contact entry (admin)
  static async updateContactEntry(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const entry = await ContactService.updateContactEntry(id, updateData);

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: "Contact entry not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Contact entry updated successfully",
        data: entry
      });
    } catch (error: any) {
      console.error("Error updating contact entry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update contact entry"
      });
    }
  }

  // Remove contact entry (admin)
  static async removeContactEntry(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const success = await ContactService.removeContactEntry(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Contact entry not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Contact entry removed successfully"
      });
    } catch (error: any) {
      console.error("Error removing contact entry:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove contact entry"
      });
    }
  }
}
