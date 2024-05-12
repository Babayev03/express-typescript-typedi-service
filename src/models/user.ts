import { IUser } from "../interfaces/IUser";
import mongoose, { Schema } from "mongoose";

const User = new Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    confirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    confirmCode: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin", "superadmin"],
    },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

const UserModel = mongoose.model<IUser & mongoose.Document>("User", User);
export default UserModel;
