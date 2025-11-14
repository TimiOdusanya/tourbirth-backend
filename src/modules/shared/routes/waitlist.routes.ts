import { Router } from "express";
import { WaitlistController } from "../controllers/waitlist.controller";
import { authenticate } from "../../../middleware/authMiddleware";

const router = Router();

// Public routes (no authentication required)
router.post("/", WaitlistController.addToWaitlist);

// Admin routes (authentication required)
router.get("/", authenticate, WaitlistController.getAllWaitlistEntries);
router.get("/stats", authenticate, WaitlistController.getWaitlistStats);
router.get("/:id", authenticate, WaitlistController.getWaitlistEntryById);
router.put("/:id", authenticate, WaitlistController.updateWaitlistEntry);
router.delete("/:id", authenticate, WaitlistController.removeFromWaitlist);

export default router;
