import express from "express";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  createDestination,
  getAllDestinations,
  getAllDestinationsSimple,
  getDestinationById,
  updateDestination,
  deleteDestination,
  createMultipleDestinations,
  deleteMultipleDestinations
} from "../controllers/destination.controller";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Destination CRUD routes
router.post("/", createDestination);
router.post("/bulk", createMultipleDestinations);
router.get("/", getAllDestinations);
router.get("/all", getAllDestinationsSimple);
router.get("/:id", getDestinationById);
router.put("/:id", updateDestination);
router.delete("/:id", deleteDestination);
router.delete("/bulk", deleteMultipleDestinations);

export default router; 