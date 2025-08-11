import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel, IUser } from "../modules/user/models/userProfile.model";
import { AdminModel, IAdmin } from "../modules/admin/models/adminProfile.model";
import { Role } from "../types/roles";
import { AuthenticatedRequest } from "../types/express";

interface DecodedToken extends JwtPayload {
  userId: string;
  role: Role;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized - Please log in" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    let user: IUser | IAdmin | null = null;

    // Check the appropriate model based on the role in the token
    if (decoded.role === Role.Admin) {
      user = await AdminModel.findById(decoded.userId);
    } else if (decoded.role === Role.User) {
      user = await UserModel.findById(decoded.userId);
    }

    if (!user) {
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    // Ensure the user object has the required properties
    const authenticatedUser = {
      ...user.toObject(),
      _id: user._id?.toString() || decoded.userId,
      role: decoded.role
    };

    req.user = authenticatedUser;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export const check2FA = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Check if user has 2FA enabled (only users have this property, not admins)
  if (req.user.role === Role.User && 'twoFactorEnabled' in req.user && req.user.twoFactorEnabled) {
    // For now, we'll skip 2FA verification since we don't have a session system
    // You can implement 2FA verification logic here later
    // For example, you could check a JWT claim or use a different approach
    return res.status(403).json({
      message: "2FA verification required",
      twoFactorRequired: true,
    });
  }
  
  next();
};
