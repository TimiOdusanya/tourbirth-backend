import { Request, Response } from "express";
import { CompanionModel } from "../models/companion.model";
import { UserModel } from "../../user/models/userProfile.model";
import { Role } from "../../../types/roles";
import bcrypt from "bcryptjs";

// Complete companion registration
export const completeCompanionRegistration = async (req: Request, res: Response) => {
  try {
    const { email, tempPassword, newPassword, firstName, lastName, phoneNumber } = req.body;

    if (!email || !tempPassword || !newPassword || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Find companion by email and temp password
    const companion = await CompanionModel.findOne({ 
      email, 
      tempPassword,
      isRegistered: false 
    });

    if (!companion) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or temporary password"
      });
    }

    // Check if user already exists with this email
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create new user account for companion
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: Role.User,
      isVerified: true // Companions are pre-verified
    });

    await newUser.save();

    // Update companion to mark as registered
    companion.isRegistered = true;
    companion.tempPassword = undefined; // Remove temp password
    await companion.save();

    res.status(201).json({
      success: true,
      message: "Companion registration completed successfully",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Companion login with temp password
export const companionLogin = async (req: Request, res: Response) => {
  try {
    const { email, tempPassword } = req.body;

    if (!email || !tempPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and temporary password are required"
      });
    }

    // Find companion by email and temp password
    const companion = await CompanionModel.findOne({ 
      email, 
      tempPassword,
      isRegistered: false 
    });

    if (!companion) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or temporary password"
      });
    }

    res.status(200).json({
      success: true,
      message: "Temporary login successful. Please complete your registration.",
      companion: {
        _id: companion._id,
        firstName: companion.firstName,
        lastName: companion.lastName,
        email: companion.email,
        phoneNumber: companion.phoneNumber
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}; 