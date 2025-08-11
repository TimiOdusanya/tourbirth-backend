import express from "express";
import uploadMediaRoutes from "./uploadMedia.routes";
import destinationRoutes from "./destination.routes";
import bookingRoutes from "./booking.routes";
import dashboardRoutes from "./dashboard.routes";
import userProfileRoutes from "./userProfile.routes";
import documentUploadRoutes from "./documentUpload.routes";

const router = express.Router();

router.use("/upload-media", uploadMediaRoutes);
router.use("/destinations", destinationRoutes);
router.use("/bookings", bookingRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/profiles", userProfileRoutes);
router.use("/documents", documentUploadRoutes);

export default router;
