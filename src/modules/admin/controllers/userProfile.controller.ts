import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { isAdmin, isUser } from "../../../types/typeGuards";
import { UserProfileService } from "../services/userProfile.service";
import { BookingStatus } from "../../../types/roles";

// Admin updates any user profile
export const updateUserProfileByAdmin = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.verificationOTP;
    delete updateData.resetPasswordOTP;

    const user = await UserProfileService.updateUserProfileByAdmin(userId, updateData);
    const userResponse = UserProfileService.sanitizeUserResponse(user);

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: userResponse
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// User updates their own profile
export const updateOwnProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isUser(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - User account required"
      });
    }

    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.verificationOTP;
    delete updateData.resetPasswordOTP;

    const user = await UserProfileService.updateOwnProfile(req.user._id, updateData);
    const userResponse = UserProfileService.sanitizeUserResponse(user);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Admin updates their own profile
export const updateAdminProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.verificationOTP;
    delete updateData.resetPasswordOTP;

    const admin = await UserProfileService.updateAdminProfile(req.user._id, updateData);
    const adminResponse = UserProfileService.sanitizeAdminResponse(admin);

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      admin: adminResponse
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Get user profile by ID (admin only)
export const getUserProfileById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;

    const user = await UserProfileService.getUserProfileById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Add companions to a user (admin only)
export const addCompanionsToUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;
    const { companions } = req.body;

    if (!companions || !Array.isArray(companions) || companions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Companions data is required and must be an array"
      });
    }

    const addedCompanions = await UserProfileService.addCompanionsToUser(userId, { companions });

    res.status(200).json({
      success: true,
      message: "Companions added successfully",
      companions: addedCompanions
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Get companions for a user (admin only)
export const getUserCompanions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;
    const companions = await UserProfileService.getUserCompanions(userId);

    res.status(200).json({
      success: true,
      companions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Update companion information (admin only)
export const updateCompanion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { companionId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.userId;
    delete updateData.isRegistered;

    const companion = await UserProfileService.updateCompanion(companionId, updateData);

    res.status(200).json({
      success: true,
      message: "Companion updated successfully",
      companion
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Update user status (admin only)
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { userId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    // Validate that status is a valid BookingStatus
    if (!Object.values(BookingStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + Object.values(BookingStatus).join(", ")
      });
    }

    const user = await UserProfileService.updateUserProfileByAdmin(userId, { status: status as BookingStatus });
    const userResponse = UserProfileService.sanitizeUserResponse(user);

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user: userResponse
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Get all users with pagination and filters (admin only)
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { page, limit, status, search, isBooked } = req.query;

    const result = await UserProfileService.getAllUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status: status as BookingStatus,
      search: search as string,
      isBooked: isBooked === 'true' ? true : isBooked === 'false' ? false : undefined
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}; 