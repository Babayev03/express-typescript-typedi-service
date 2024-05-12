import { Router } from "express";
import createBlog from "./createBlog";
import getBlogs from "./getBlogs";
import getBlogById from "./getBlogById";
import editBlog from "./editBlog";
import deleteBlog from "./deleteBlog";

const route = Router();

export default (app: Router) => {
  app.use("/blog", route);
  createBlog(app, route);
  getBlogs(app, route);
  getBlogById(app, route);
  editBlog(app, route);
  deleteBlog(app, route);
  return app;
};
