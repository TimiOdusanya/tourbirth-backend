import { UserModel } from "../../user/models/userProfile.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generate2FASecret, generateOTP, sendEmail } from "../../../utils/otpUtils";

export const signup = async (userData: any) => {
  const existingUser = await UserModel.findOne({
    email: userData.email,
  }).exec();
  if (existingUser) throw new Error("User with this email already exists.");

  const user = new UserModel({
    ...userData,
    role: "user"
  });

  await sendEmail(user.email, "welcomeEmail", {
    subject: "Welcome to Tour Birth",
    body: "Thank you for signing up! We're excited to have you on board.",
    buttonText: "Get Started",
    buttonLink: "https://tourbirth-dashboard.vercel.app",
  });

  await user.save();
  return user;
};

export const login = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).exec();
  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid email or password");
  }

  const accessToken = jwt.sign(
    { userId: user._id, role: "user" },
    process.env.JWT_SECRET!,
    {
      expiresIn: "2d",
    }
  );

  return { user, accessToken };
};

export const forgotPassword = async (email: string) => {
  const user = await UserModel.findOne({ email }).exec();
  if (!user) throw new Error("User with that email not found");

  const otp = generateOTP();
  user.resetPasswordOTP = otp;
  await user.save();

  await sendEmail(user.email, "passwordReset", {
    subject: "Password Reset Request",
    body: "Your One-Time Password (OTP) to reset your password is:",
    otp,
  });

  return { message: "Steps to reset password has been sent to email" };
};

export const resetPassword = async (email: string, newPassword: string) => {
  const user = await UserModel.findOne({ email }).exec();
  if (!user) throw new Error("User not found");

  const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
  if (isNewPasswordSame)
    throw new Error("New password cannot be the same as the old password");

  user.password = newPassword;
  await user.save();

  return { message: "Password reset successfully" };
};

export const verifyForgotPassword = async (email: string, otp: string) => {
  const user = await UserModel.findOne({ email }).exec();
  if (!user) throw new Error("User not found");
  if (user.resetPasswordOTP !== otp) throw new Error("Invalid OTP");

  user.isVerified = true;
  user.resetPasswordOTP = undefined;
  await user.save();

  return { message: "Account verified successfully" };
};


export const resendVerificationOTP = async (email: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("User not found");
    
    const otp = generateOTP();
    user.verificationOTP = otp;
    await user.save();
    
    await sendEmail(user.email, "accountVerification", {
        subject: "Verify Your Account",
        body: "Your One-Time Password (OTP) to verify your account is:",
        otp,
    });
    
    return { message: "New OTP sent to email" };
};

export const verifyAccount = async (email: string, otp: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("User not found");
    if (user.verificationOTP !== otp) throw new Error("Invalid OTP");
    
    user.isVerified = true;
    user.verificationOTP = undefined;
    await user.save();
    
    return { message: "Account verified successfully" };
};

export const getUserProfile = async (userId: string) => {
  return await UserModel.findById(userId).exec();
};



export const enable2FA = async (userId: string) => {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");
  
    const secret = generate2FASecret();
    user.twoFactorSecret = secret.base32; // Store the secret key
    user.twoFactorEnabled = true; // Enable 2FA
    await user.save();
  
    return { secret: secret.base32, otpauthUrl: secret.otpauth_url };
  };
  

export const changePassword = async (email: string, oldPassword: string, newPassword: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("User not found");
  
    // Check if the old password matches the current password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error("Old password is incorrect");
    }
  
    // Check if the new password is the same as the old password
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
      throw new Error("New password cannot be the same as the old password");
    }
  
    // Hash and save the new password
    user.password = newPassword;
    await user.save();
  
    return { message: "Password changed successfully" };
  };