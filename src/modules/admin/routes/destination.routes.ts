import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination
} from "../controllers/destination.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Destination CRUD routes
router.post("/", createDestination);
router.get("/", getAllDestinations);
router.get("/:id", getDestinationById);
router.put("/:id", updateDestination);
router.delete("/:id", deleteDestination);

export default router; 