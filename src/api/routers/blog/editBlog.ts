import { Container } from "typedi";
import { NextFunction, Request, Response, Router } from "express";
import BlogService from "../../../services/blog";
import middlewares from "../../middlewares";

export default (app: Router, route: Router) => {
  route.post(
    "/edit/:blogId",
    middlewares.isAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const blogService = Container.get(BlogService);
        const { title, text } = req.body;
        const userId = req.token._id;
        const blogId = req.params.blogId;
        const image = req.files?.image;

        const response = await blogService.updateBlog(
          userId,
          blogId,
          title,
          text,
          image
        );

        return res.json({ response }).status(200);
      } catch (e) {
        return next(e);
      }
    }
  );
};
