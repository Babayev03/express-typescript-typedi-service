import { Container } from "typedi";
import AuthService from "../../../services/auth";
import { NextFunction, Request, Response, Router } from "express";

export default (app: Router, route: Router) => {
  route.post(
    "/signIn",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authService = Container.get(AuthService);
        const { email, password } = req.body;

        const result = await authService.SignInUser(email, password);

        if ("token" in result) {
          return res.status(200).json(result).end();
        } else {
          return res.status(200).json(result).end();
        }
      } catch (e) {
        return next(e);
      }
    }
  );
};
