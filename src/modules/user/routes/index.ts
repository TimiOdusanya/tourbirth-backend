import express from "express";
import profileRoutes from "./profile.routes";
import reviewRoutes from "./review.routes";

const router = express.Router();

router.use("/profile", profileRoutes);
router.use("/reviews", reviewRoutes);

export default router;
