import { Router } from "express";
import getAdmins from "./getAdmins";
import getAdminById from "./getAdminById";
import deleteAdmin from "./deleteAdmin";
import editAdmin from "./editAdmin";

const route = Router();

export default (app: Router) => {
  app.use("/admin", route);
  getAdmins(app, route);
  getAdminById(app, route);
  deleteAdmin(app, route);
  editAdmin(app, route);
  return app;
};
