import express from "express";
import multer from "multer";
import { authenticate } from "../../../middleware/authMiddleware";
import {
  uploadDocuments,
  uploadItineraries,
  removeDocument,
  removeItinerary
} from "../controllers/documentUpload.controller";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Apply auth middleware to all routes
router.use(authenticate);

// Document and itinerary upload routes
router.post("/:bookingId/documents", upload.array('documents', 10), uploadDocuments);
router.post("/:bookingId/itineraries", upload.array('itineraries', 10), uploadItineraries);
router.delete("/:bookingId/documents/:documentIndex", removeDocument);
router.delete("/:bookingId/itineraries/:itineraryIndex", removeItinerary);

export default router; 