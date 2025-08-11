import { Request, Response } from "express";
import { DestinationService } from "../services/destination.service";

// Create a new destination
export const createDestination = async (req: Request, res: Response) => {
  try {
    const { city, country } = req.body;

    if (!city || !country) {
      return res.status(400).json({ 
        success: false, 
        message: "City and country are required" 
      });
    }

    const destination = await DestinationService.createDestination(city, country);

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      destination
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all destinations
export const getAllDestinations = async (req: Request, res: Response) => {
  try {
    const destinations = await DestinationService.getAllDestinations();

    res.status(200).json({
      success: true,
      destinations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Get destination by ID
export const getDestinationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const destination = await DestinationService.getDestinationById(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found"
      });
    }

    res.status(200).json({
      success: true,
      destination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Update destination
export const updateDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { city, country } = req.body;

    if (!city && !country) {
      return res.status(400).json({
        success: false,
        message: "At least one field (city or country) is required"
      });
    }

    const destination = await DestinationService.updateDestination(id, { city, country });

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      destination
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Delete destination (soft delete)
export const deleteDestination = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await DestinationService.deleteDestination(id);

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully"
    });
  } catch (error: any) {
    const statusCode = error.message.includes("not found") ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}; 