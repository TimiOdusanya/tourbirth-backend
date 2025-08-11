import { Request } from "express";
import { IUser } from "../modules/user/models/userProfile.model";
import { IAdmin } from "../modules/admin/models/adminProfile.model";

export interface AuthenticatedRequest extends Request {
  user?: IUser | IAdmin;
}
