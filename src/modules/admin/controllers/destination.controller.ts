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

// Get all destinations with pagination and search
export const getAllDestinations = async (req: Request, res: Response) => {
  try {
    // Get query parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be greater than 0"
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100"
      });
    }

    const result = await DestinationService.getAllDestinationsPaginated(page, limit, search);

    res.status(200).json({
      success: true,
      destinations: result.destinations,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Get all destinations without pagination (for dropdowns, simple lists)
export const getAllDestinationsSimple = async (req: Request, res: Response) => {
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

// Create multiple destinations
export const createMultipleDestinations = async (req: Request, res: Response) => {
  try {
    const { destinations } = req.body;

    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Destinations array is required and must not be empty"
      });
    }

    // Validate each destination
    for (const dest of destinations) {
      if (!dest.city || !dest.country) {
        return res.status(400).json({
          success: false,
          message: "Each destination must have city and country"
        });
      }
    }

    const result = await DestinationService.createMultipleDestinations(destinations);

    // Determine appropriate status code based on results
    let statusCode = 201;
    let success = true;
    let message = `Successfully created ${result.created.length} destinations`;

    if (result.created.length === 0 && result.errors.length > 0) {
      // All destinations failed to create (likely due to conflicts)
      statusCode = 409; // Conflict
      success = false;
      message = "No destinations were created. All destinations already exist or failed to create.";
    } else if (result.errors.length > 0) {
      // Some destinations failed, some succeeded
      message = `Partially successful: ${result.created.length} created, ${result.errors.length} failed`;
    }

    res.status(statusCode).json({
      success,
      message,
      created: result.created,
      errors: result.errors,
      summary: {
        total: destinations.length,
        created: result.created.length,
        errors: result.errors.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Delete multiple destinations
export const deleteMultipleDestinations = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "IDs array is required and must not be empty"
      });
    }

    // Validate that all IDs are valid MongoDB ObjectIds
    for (const id of ids) {
      if (typeof id !== 'string' || id.trim() === '') {
        return res.status(400).json({
          success: false,
          message: "All IDs must be valid strings"
        });
      }
    }

    const result = await DestinationService.deleteMultipleDestinations(ids);

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deleted} destinations`,
      summary: {
        total: ids.length,
        deleted: result.deleted,
        errors: result.errors.length
      },
      errors: result.errors
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}; 