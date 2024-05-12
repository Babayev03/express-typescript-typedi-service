import { Container } from "typedi";
import AuthService from "../../../services/auth";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../../api/middlewares";

export default (app: Router, route: Router) => {
  route.post(
    "/admin/signUp",
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authService = Container.get(AuthService);
        const { email, password } = req.body;
        const userId = req.token._id;

        const { message } = await authService.SignUpUser({
          userId,
          email,
          password,
          role: "admin",
        });
        return res.json({ message }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
