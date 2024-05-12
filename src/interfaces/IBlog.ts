import mongoose from "mongoose";

export interface IBlog {
  _id: mongoose.Types.ObjectId;
  image: string;
  title: string;
  text: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
