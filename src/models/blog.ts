import { IBlog } from "../interfaces/IBlog";
import mongoose, { Schema } from "mongoose";

const Blog = new Schema(
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
    text: {
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

const BlogModel = mongoose.model<IBlog & mongoose.Document>("Blog", Blog);
export default BlogModel;
