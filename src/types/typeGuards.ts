import { IUser } from "../modules/user/models/userProfile.model";
import { IAdmin } from "../modules/admin/models/adminProfile.model";

// Utility type guards
export const isUser = (user: any): user is IUser & { _id: string } => {
  return user && user.role === 'user' && typeof user._id === 'string';
};

export const isAdmin = (user: any): user is IAdmin & { _id: string } => {
  return user && user.role === 'admin' && typeof user._id === 'string';
}; 