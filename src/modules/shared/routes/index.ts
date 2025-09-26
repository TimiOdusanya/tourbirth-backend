import express from "express";
import userAuthRoutes from "./userAuth.routes";
import adminAuthRoutes from "./adminAuth.routes";
import companionAuthRoutes from "./companionAuth.routes";
import userRoutes from "../../user/routes";
import waitlistRoutes from "./waitlist.routes";
import contactRoutes from "./contact.routes";

const router = express.Router();

router.use("/", userAuthRoutes);
router.use("/admin", adminAuthRoutes);
router.use("/companion", companionAuthRoutes);
router.use("/user", userRoutes);
router.use("/waitlist", waitlistRoutes);
router.use("/contact", contactRoutes);

export default router;
