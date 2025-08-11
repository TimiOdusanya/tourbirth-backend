import { AdminModel } from "../../admin/models/adminProfile.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP, sendEmail } from "../../../utils/otpUtils";

export const signup = async (adminData: any) => {
  const existingAdmin = await AdminModel.findOne({
    email: adminData.email,
  }).exec();
  if (existingAdmin) throw new Error("Admin with this email already exists.");

  // Ensure the role is set to admin
  const admin = new AdminModel({
    ...adminData,
    role: "admin"
  });

  await sendEmail(admin.email, "welcomeEmail", {
    subject: "Welcome Admin",
    body: "Your admin account has been created.",
    buttonText: "Get Started",
    buttonLink: "https://tourbirth-dashboard.vercel.app",
  });

  await admin.save();
  return admin;
};

export const login = async (email: string, password: string) => {
  const admin = await AdminModel.findOne({ email }).exec();
  if (!admin || !(await admin.comparePassword(password))) {
    throw new Error("Invalid email or password");
  }

  const accessToken = jwt.sign(
    { userId: admin._id, role: "admin" },
    process.env.JWT_SECRET!,
    {
      expiresIn: "2d",
    }
  );

  return { admin, accessToken };
};

export const forgotPassword = async (email: string) => {
  const admin = await AdminModel.findOne({ email }).exec();
  if (!admin) throw new Error("Admin with that email not found");

  const otp = generateOTP();
  admin.resetPasswordOTP = otp;
  await admin.save();

  await sendEmail(admin.email, "passwordReset", {
    subject: "Admin Password Reset",
    body: "Your One-Time Password (OTP) is:",
    otp,
  });

  return { message: "Steps to reset password has been sent to email" };
};

export const resetPassword = async (email: string, newPassword: string) => {
  const admin = await AdminModel.findOne({ email }).exec();
  if (!admin) throw new Error("Admin not found");

  const isNewPasswordSame = await bcrypt.compare(newPassword, admin.password);
  if (isNewPasswordSame)
    throw new Error("New password cannot be the same as the old password");

  admin.password = newPassword;
  await admin.save();

  return { message: "Password reset successfully" };
};

export const verifyForgotPassword = async (email: string, otp: string) => {
  const admin = await AdminModel.findOne({ email }).exec();
  if (!admin) throw new Error("Admin not found");
  if (admin.resetPasswordOTP !== otp) throw new Error("Invalid OTP");

  admin.resetPasswordOTP = undefined;
  await admin.save();

  return { message: "Account verified successfully" };
};

export const getAdminProfile = async (adminId: string) => {
  return await AdminModel.findById(adminId).exec();
};
