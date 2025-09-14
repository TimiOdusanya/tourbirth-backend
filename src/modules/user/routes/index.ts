import express from "express";
import profileRoutes from "./profile.routes";
import reviewRoutes from "./review.routes";
import userRoutes from "./user.routes";

const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/reviews", reviewRoutes);
router.use("/user", userRoutes);

export default router;
