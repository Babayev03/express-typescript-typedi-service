import { Router } from "express";
import createWork from "./createWork";
import getWorks from "./getWorks";
import getWorkById from "./getWorkById";
import editWork from "./editWork";
import deleteWork from "./deleteWork";

const route = Router();

export default (app: Router) => {
  app.use("/work", route);
  createWork(app, route);
  getWorks(app, route);
  getWorkById(app, route);
  editWork(app, route);
  deleteWork(app, route);
  return app;
};
