import { Request, Response } from "express";
import * as authService from "../services/userAuth.service";
import { AuthenticatedRequest } from "../../../types/express";
import { isUser } from "../../../types/typeGuards";
import { updateProfilePicture } from "../../../utils/profilePictureUtils";
import { UserModel } from "../../user/models/userProfile.model";

export const signup = async (req: Request, res: Response) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({ message: "User created successfully", user });
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
      user: result.user,
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

export const verifyAccount = async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyAccount(email, otp);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  export const resendVerificationOTP = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await authService.resendVerificationOTP(email);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };


  export const logout = (req: Request, res: Response) => {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
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

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
   
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!isUser(req.user)) {
      return res.status(403).json({ message: "Access denied - User account required" });
    }

   
    const user = await authService.getUserProfile(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfilePicture = async (req: AuthenticatedRequest, res: Response) => {
  try {
   
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }


    if (!isUser(req.user)) {
      return res.status(403).json({ message: "Access denied - User account required" });
    }

    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture data is required" });
    }

    const updatedUser = await updateProfilePicture(UserModel, req.user._id, profilePicture);
    
    res.json({ 
      success: true, 
      message: "Profile picture updated successfully",
      user: updatedUser 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};


export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { email, oldPassword, newPassword } = req.body;
      const result = await authService.changePassword(email, oldPassword, newPassword);
      res.status(200).json(result);
    } catch (error: any ) {
      res.status(400).json({ message: error.message });
    }
  };


  export const enable2FA = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.body;
      const result = await authService.enable2FA(userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };