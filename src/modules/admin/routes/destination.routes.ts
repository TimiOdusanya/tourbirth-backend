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


router.get("/", getAllDestinations);
router.get("/all", getAllDestinationsSimple);


router.use(authenticate);


router.post("/", createDestination);
router.post("/bulk", createMultipleDestinations);
router.get("/:id", getDestinationById);
router.put("/:id", updateDestination);
router.delete("/:id", deleteDestination);
router.delete("/bulk", deleteMultipleDestinations);

export default router; 