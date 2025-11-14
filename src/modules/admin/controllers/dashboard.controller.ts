import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../types/express";
import { isAdmin } from "../../../types/typeGuards";
import { DashboardService } from "../services/dashboard.service";
import { Currency } from "../../../types/roles";

// Get dashboard statistics - with optional currency filter
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const { currency } = req.query;

    // Validate currency if provided
    if (currency && !Object.values(Currency).includes(currency as Currency)) {
      return res.status(400).json({
        success: false,
        message: "Invalid currency. Must be either 'naira' or 'usd'"
      });
    }

    const dashboard = await DashboardService.getDashboardStats(currency as Currency | undefined);

    res.status(200).json({
      success: true,
      dashboard
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// Get all users with pagination
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Admin required"
      });
    }

    const {
      page = 1,
      limit = 10,
      search
    } = req.query;

    const result = await DashboardService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
      search: search as string
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}; 