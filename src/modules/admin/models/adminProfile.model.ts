// src/modules/admin/models/adminProfile.model.ts
import { Schema } from "mongoose";
import { Role } from "../../../types/roles";
import { AccountModel, IAccountBase } from "../../shared/models/account.model";

export interface IAdmin extends IAccountBase {
  phoneNumber?: string;
  address?: string;
}

const AdminSchema = new Schema<IAdmin>({
  phoneNumber: { type: String },
  address: { type: String }
});

export const AdminModel = AccountModel.discriminator<IAdmin>(Role.Admin, AdminSchema);
