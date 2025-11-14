import { Request } from "express";
import { IUser } from "../modules/user/models/userProfile.model";
import { IAdmin } from "../modules/admin/models/adminProfile.model";
import { ICompanion } from "../modules/shared/models/companion.model";

export interface AuthenticatedRequest extends Request {
  user?: (IUser | IAdmin | ICompanion) & { 
    _id: string;
    role: string;
    companionId?: string;
  };
}
