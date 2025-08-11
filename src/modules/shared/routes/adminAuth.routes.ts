import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyForgotPassword,
  getAdminProfile,
  updateAdminProfilePicture,
} from "../controllers/adminAuth.controller";
import { authenticate } from "../../../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.post("/verify-forgot-password", verifyForgotPassword);
//router.get("/profile", authenticate, getAdminProfile);
router.put("/profile/picture", authenticate, updateAdminProfilePicture);

export default router;
