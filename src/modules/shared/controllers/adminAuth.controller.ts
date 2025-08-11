import { Request, Response } from "express";
import * as authService from "../services/adminAuth.service";
import { AuthenticatedRequest } from "../../../types/express";
import { isAdmin } from "../../../types/typeGuards";
import { updateProfilePicture } from "../../../utils/profilePictureUtils";
import { AdminModel } from "../../admin/models/adminProfile.model";

export const signup = async (req: Request, res: Response) => {
  try {
    const admin = await authService.signup(req.body);
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.cookie("jwt", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login successful",
      admin: result.admin,
      accessToken: result.accessToken,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    const result = await authService.resetPassword(email, newPassword);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyForgotPassword(email, otp);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAdminProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user exists and is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Use utility function to check if user is actually an Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: "Access denied - Admin account required" });
    }

    const admin = await authService.getAdminProfile(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ success: true, admin });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAdminProfilePicture = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user exists and is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Use utility function to check if user is actually an Admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: "Access denied - Admin account required" });
    }

    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture data is required" });
    }

    const updatedAdmin = await updateProfilePicture(AdminModel, req.user._id, profilePicture);
    
    res.json({ 
      success: true, 
      message: "Profile picture updated successfully",
      admin: updatedAdmin 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
