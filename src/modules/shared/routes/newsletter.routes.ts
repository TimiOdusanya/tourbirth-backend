import express from "express";
import { NewsletterController } from "../controllers/newsletter.controller";
import { authenticate } from "../../../middleware/authMiddleware";

const router = express.Router();

router.post("/subscribe", NewsletterController.subscribeToNewsletter);
router.post("/unsubscribe", NewsletterController.unsubscribeFromNewsletter);

router.get("/", authenticate, NewsletterController.getAllSubscriptions);
router.get("/stats", authenticate, NewsletterController.getNewsletterStats);
router.get("/:id", authenticate, NewsletterController.getSubscriptionById);

export default router;

