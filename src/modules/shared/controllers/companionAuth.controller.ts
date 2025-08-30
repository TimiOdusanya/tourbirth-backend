import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { Role } from "../../../types/roles";
import { 
  companionLogin, 
  updateCompanionProfile, 
  getCompanionProfile,
  changeCompanionPassword 
} from "../services/companionAuth.service";

// Companion login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const result = await companionLogin(email, password);

    res.status(200).json({
      success: true,
      message: result.message || "Login successful",
      companion: result.companion,
      accessToken: result.accessToken,
      isTempPassword: result.isTempPassword
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update companion profile (authenticated)
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.Companion) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Companion required"
      });
    }

    const updateData = req.body;
    const companionId = req.user._id;

    // Remove sensitive fields that shouldn't be updated
    delete updateData.email;
    delete updateData.userId;
    delete updateData.isRegistered;

    const companion = await updateCompanionProfile(companionId, updateData);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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

// Get companion profile (authenticated)
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.Companion) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Companion required"
      });
    }

    const companionId = req.user._id;
    const companion = await getCompanionProfile(companionId);

    res.status(200).json({
      success: true,
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

// Change companion password (authenticated)
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== Role.Companion) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Companion required"
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required"
      });
    }

    const companionId = req.user._id;
    const result = await changeCompanionPassword(companionId, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 