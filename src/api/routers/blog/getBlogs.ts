import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import BlogService from "../../../services/blog";
import middlewares from "../../middlewares";

export default (app: Router, route: Router) => {
  route.get(
    "/getAll/:currentPage/:blogsPerPage",
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const blogService = Container.get(BlogService);
        const userId = req.token._id;
        const currentPage = parseInt(req.params.currentPage);
        const blogsPerPage = parseInt(req.params.blogsPerPage);

        const response = await blogService.getBlogs(
          userId,
          currentPage,
          blogsPerPage
        );

        return res.json({ response }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
