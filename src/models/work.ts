import { IWork } from "../interfaces/IWork";
import mongoose, { Schema } from "mongoose";

const Work = new Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

const WorkModel = mongoose.model<IWork & mongoose.Document>("Work", Work);
export default WorkModel;
