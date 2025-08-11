import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { isAdmin, isUser } from "../../../types/typeGuards";
import { UserProfileService } from "../services/userProfile.service";

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