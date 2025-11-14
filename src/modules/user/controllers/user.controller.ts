import { Request, Response } from "express";
import { UserService, UpdateUserProfileData, UpdateProfilePictureData } from "../services/user.service";
import { AuthenticatedRequest } from "../../../types/express";

export class UserController {
  // Update user profile information
  static async updateUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const updateData: UpdateUserProfileData = req.body;
      const userId = req.user._id.toString();

      // Validate required fields if provided
      if (updateData.phoneNumber && !updateData.phoneNumber.trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone number cannot be empty"
        });
      }

      if (updateData.gender && !['male', 'female', 'others'].includes(updateData.gender)) {
        return res.status(400).json({
          success: false,
          message: "Gender must be 'male', 'female', or 'others'"
        });
      }

      const updatedUser = await UserService.updateUserProfile(userId, updateData);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: updatedUser
        }
      });
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update profile"
      });
    }
  }

  // Update user profile picture
  static async updateProfilePicture(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const { profilePicture } = req.body;

      if (!profilePicture || !Array.isArray(profilePicture)) {
        return res.status(400).json({
          success: false,
          message: "Profile picture data is required and must be an array"
        });
      }

      // Validate profile picture data
      for (const pic of profilePicture) {
        if (!pic.name || !pic.size || !pic.type || !pic.link) {
          return res.status(400).json({
            success: false,
            message: "Each profile picture must have name, size, type, and link"
          });
        }
      }

      const userId = req.user._id.toString();
      const updateData: UpdateProfilePictureData = { profilePicture };

      const updatedUser = await UserService.updateProfilePicture(userId, updateData);

      res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        data: {
          user: updatedUser
        }
      });
    } catch (error: any) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update profile picture"
      });
    }
  }

  // Get all bookings for a user
  static async getUserBookings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const userId = req.user._id.toString();
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        status: req.query.status as string,
        bookingType: req.query.bookingType as string,
        isPrimary: req.query.isPrimary === 'true' ? true : req.query.isPrimary === 'false' ? false : undefined
      };

      const result = await UserService.getUserBookings(userId, filters);

      res.status(200).json({
        success: true,
        message: "User bookings retrieved successfully",
        data: result
      });
    } catch (error: any) {
      console.error("Error getting user bookings:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve bookings"
      });
    }
  }

  // Get a specific booking for a user
  static async getUserBookingById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const userId = req.user._id.toString();
      const { bookingId } = req.params;

      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: "Booking ID is required"
        });
      }

      const booking = await UserService.getUserBookingById(userId, bookingId);

      res.status(200).json({
        success: true,
        message: "Booking retrieved successfully",
        data: {
          booking
        }
      });
    } catch (error: any) {
      console.error("Error getting user booking:", error);
      if (error.message === "Booking not found") {
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve booking"
      });
    }
  }

  // Get user profile
  static async getUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const userId = req.user._id.toString();
      const user = await UserService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: {
          user
        }
      });
    } catch (error: any) {
      console.error("Error getting user profile:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve user profile"
      });
    }
  }

  // Get user booking statistics
  static async getUserBookingStats(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const userId = req.user._id.toString();
      const stats = await UserService.getUserBookingStats(userId);

      res.status(200).json({
        success: true,
        message: "User booking statistics retrieved successfully",
        data: stats
      });
    } catch (error: any) {
      console.error("Error getting user booking stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve booking statistics"
      });
    }
  }

  // Debug endpoint to check all bookings for a user
  static async debugUserBookings(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated"
        });
      }

      const userId = req.user._id.toString();
      
      // Get all bookings without filters
      const allBookings = await UserService.debugGetAllUserBookings(userId);
      
      res.status(200).json({
        success: true,
        message: "Debug: All user bookings retrieved",
        data: {
          userId,
          totalBookings: allBookings.length,
          bookings: allBookings
        }
      });
    } catch (error: any) {
      console.error("Error in debug user bookings:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve debug bookings"
      });
    }
  }
}
