import { Container } from "typedi";
import AuthService from "../../../services/auth";
import { NextFunction, Request, Response, Router } from "express";

export default (app: Router, route: Router) => {
  route.post(
    "/confirmOtp",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authService = Container.get(AuthService);
        const { userId, otp } = req.body;
        const { token } = await authService.confirmOtp(userId, otp);
        return res.json({ token }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
