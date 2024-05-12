import { Router } from "express";
import signUpUser from "./signUpUser";
import confirmOtp from "./confirmOtp";
import signIn from "./signIn";
import signUpAdmin from "./signUpAdmin";

const route = Router();

export default (app: Router) => {
  app.use("/auth", route);
  signUpUser(app, route);
  signIn(app, route);
  signUpAdmin(app, route);
  confirmOtp(app, route);
  return app;
};
