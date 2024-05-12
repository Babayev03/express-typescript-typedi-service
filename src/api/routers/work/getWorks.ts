import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import middlewares from "../../middlewares";
import WorkService from "../../../services/work";

export default (app: Router, route: Router) => {
  route.get(
    "/getAll/:currentPage/:worksPerPage",
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const blogService = Container.get(WorkService);
        const userId = req.token._id;
        const currentPage = parseInt(req.params.currentPage);
        const worksPerPage = parseInt(req.params.worksPerPage);
        const response = await blogService.getWorks(
          userId,
          currentPage,
          worksPerPage
        );

        return res.json({ response }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
