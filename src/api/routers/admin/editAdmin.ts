import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../middlewares";
import AdminService from "../../../services/admin";

export default (app: Router, route: Router) => {
  route.post(
    "/edit/:adminId",
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const blogService = Container.get(AdminService);
        const userId = req.token._id;
        const { adminId } = req.params;
        const { email, password, name } = req.body;
        const response = await blogService.editAdmin(
          userId,
          adminId,
          email,
          password,
          name
        );

        return res.json({ response }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
