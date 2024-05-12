import { Container } from "typedi";
import AuthService from "../../../services/auth";
import { NextFunction, Request, Response, Router } from "express";

export default (app: Router, route: Router) => {
  route.post(
    "/signUp",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authService = Container.get(AuthService);
        const { email, password } = req.body;

        const { message } = await authService.SignUpUser({
          email,
          password,
          role: "user",
        });
        return res.json({ message }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
