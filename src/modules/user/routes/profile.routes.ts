import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import { updateOwnProfile, getUserProfileById } from "../../admin/controllers/userProfile.controller";
import { UserProfileService } from "../../admin/services/userProfile.service";
import { AuthenticatedRequest } from "../../../types/express";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// User profile management routes
router.put("/", updateOwnProfile);
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const user = await UserProfileService.getUserProfileById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }
    
    const userResponse = UserProfileService.sanitizeUserResponse(user);
    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
});

export default router; 