// src/modules/user/models/userProfile.model.ts
import { Schema } from "mongoose";
import { Role, MaritalStatus, UserGender } from "../../../types/roles";
import { AccountModel, IAccountBase } from "../../shared/models/account.model";

export interface IUser extends IAccountBase {
  gender: string;
  phoneNumber: string;
  dateOfBirth?: Date;
  maritalStatus?: MaritalStatus;
  anniversaryDate?: Date;
  instagramUsername?: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
}

const UserSchema = new Schema<IUser>({
  gender: { 
    type: String, 
    required: true,
    enum: Object.values(UserGender),
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  dateOfBirth: { 
    type: Date 
  },
  maritalStatus: { 
    type: String, 
    enum: Object.values(MaritalStatus) 
  },
  anniversaryDate: { 
    type: Date 
  },
  instagramUsername: { 
    type: String 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  twoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  twoFactorSecret: { 
    type: String, 
    default: "" 
  },
});


export const UserModel = AccountModel.discriminator<IUser>(
  Role.User,
  UserSchema
);
