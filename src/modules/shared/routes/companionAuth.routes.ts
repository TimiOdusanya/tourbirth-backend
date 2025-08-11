import express from "express";
import {
  completeCompanionRegistration,
  companionLogin
} from "../controllers/companionAuth.controller";

const router = express.Router();

// Companion authentication routes (no auth required)
router.post("/complete-registration", completeCompanionRegistration);
router.post("/login", companionLogin);

export default router; 