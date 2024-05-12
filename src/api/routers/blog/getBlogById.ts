import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import BlogService from "../../../services/blog";
import middlewares from "../../middlewares";

export default (app: Router, route: Router) => {
  route.get(
    "/:blogId",
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const blogService = Container.get(BlogService);
        const userId = req.token._id;
        const blogId = req.params.blogId;
        const response = await blogService.getBlogById(userId, blogId);

        return res.json({ response }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
