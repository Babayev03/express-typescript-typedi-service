import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../middlewares";
import WorkService from "../../../services/work";

export default (app: Router, route: Router) => {
  route.post(
    "/create",
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const blogService = Container.get(WorkService);
        const { title } = req.body;
        const userId = req.token._id;
        const image = req.files?.image;
        const response = await blogService.createWork(userId, title, image);
        return res.json({ response }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
