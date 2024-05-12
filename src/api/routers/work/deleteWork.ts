import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import WorkService from "../../../services/work";
import middlewares from "../../middlewares";

export default (app: Router, route: Router) => {
  route.delete(
    "/delete/:workId",
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const blogService = Container.get(WorkService);
        const userId = req.token._id;
        const workId = req.params.workId;
        const response = await blogService.deleteWork(userId, workId);

        return res.json({ response }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
