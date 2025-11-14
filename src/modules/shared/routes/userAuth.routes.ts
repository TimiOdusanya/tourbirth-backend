import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyAccount,
  resendVerificationOTP,
  logout,
  getUserProfile,
  verifyForgotPassword,
  updateUserProfilePicture,
  changePassword,
  enable2FA,
} from "../controllers/userAuth.controller";
import { authenticate, check2FA } from "../../../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.post("/verify", verifyAccount);
router.post("/verify-forgot-password", verifyForgotPassword);
router.post("/resend-verification", resendVerificationOTP);
router.post("/logout", logout);
router.get("/user-profile", authenticate, getUserProfile);


router.put('/change-password', authenticate, check2FA, changePassword);
//router.patch('/update-profile', authenticate, check2FA, updateProfile);
router.post('/two-factor-auth', authenticate, check2FA, enable2FA);
router.put("/profile/picture", authenticate, updateUserProfilePicture);

export default router;
