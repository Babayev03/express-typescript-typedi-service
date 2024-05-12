import mongoose from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  confirmed: boolean;
  confirmCode: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin";
  createdAt: Date;
  updatedAt: Date;
}
