// src/modules/admin/models/adminProfile.model.ts
import { Schema } from "mongoose";
import { Role, MaritalStatus, UserGender } from "../../../types/roles";
import { AccountModel, IAccountBase } from "../../shared/models/account.model";

export interface IAdmin extends IAccountBase {
  phoneNumber?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: Date;
  maritalStatus?: MaritalStatus;
  anniversaryDate?: Date;
  instagramUsername?: string;
}

const AdminSchema = new Schema<IAdmin>({
  phoneNumber: { type: String },
  address: { type: String },
  gender: { 
    type: String, 
    enum: Object.values(UserGender)
  },
  dateOfBirth: { type: Date },
  maritalStatus: { 
    type: String, 
    enum: Object.values(MaritalStatus) 
  },
  anniversaryDate: { type: Date },
  instagramUsername: { type: String }
});

export const AdminModel = AccountModel.discriminator<IAdmin>(Role.Admin, AdminSchema);
