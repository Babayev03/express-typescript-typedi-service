import mongoose from "mongoose";

export interface IWork {
  _id: mongoose.Types.ObjectId;
  image: string;
  title: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
