import express from "express";
import userAuthRoutes from "./userAuth.routes";
import adminAuthRoutes from "./adminAuth.routes";
import companionAuthRoutes from "./companionAuth.routes";
import userRoutes from "../../user/routes";
import waitlistRoutes from "./waitlist.routes";

const router = express.Router();

router.use("/", userAuthRoutes);
router.use("/admin", adminAuthRoutes);
router.use("/companion", companionAuthRoutes);
router.use("/user", userRoutes);
router.use("/waitlist", waitlistRoutes);

export default router;
