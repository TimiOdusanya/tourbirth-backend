import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { isAdmin } from "../../../types/typeGuards";
import { DocumentUploadService } from "../services/documentUpload.service";

// Upload documents to a booking
export const uploadDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const uploadedFiles = await DocumentUploadService.uploadDocuments(bookingId, files);

    res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      documents: uploadedFiles
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Upload itineraries to a booking
export const uploadItineraries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const uploadedFiles = await DocumentUploadService.uploadItineraries(bookingId, files);

    res.status(200).json({
      success: true,
      message: "Itineraries uploaded successfully",
      itineraries: uploadedFiles
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Remove document from booking
export const removeDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId, documentIndex } = req.params;

    const index = parseInt(documentIndex);
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document index"
      });
    }

    const removedDocument = await DocumentUploadService.removeDocument(bookingId, index);

    res.status(200).json({
      success: true,
      message: "Document removed successfully",
      removedDocument
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Remove itinerary from booking
export const removeItinerary = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { bookingId, itineraryIndex } = req.params;

    const index = parseInt(itineraryIndex);
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: "Invalid itinerary index"
      });
    }

    const removedItinerary = await DocumentUploadService.removeItinerary(bookingId, index);

    res.status(200).json({
      success: true,
      message: "Itinerary removed successfully",
      removedItinerary
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}; 