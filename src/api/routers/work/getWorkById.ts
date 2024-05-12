import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../middlewares";
import WorkService from "../../../services/work";

export default (app: Router, route: Router) => {
  route.get(
    "/:workId",
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const blogService = Container.get(WorkService);
        const userId = req.token._id;
        const workId = req.params.workId;
        const response = await blogService.getWorkById(userId, workId);

        return res.json({ response }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
