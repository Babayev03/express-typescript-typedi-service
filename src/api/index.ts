import { Router } from "express";
import auth from "./routers/auth";
import blog from "./routers/blog";
import work from "./routers/work";
import admin from "./routers/admin";
export default () => {
  const app = Router();
  auth(app);
  blog(app);
  work(app);
  admin(app);
  return app;
};
