import express, { Request, Response, NextFunction } from "express";
import config from "../config";
import { isCelebrateError } from "celebrate";
import routes from "../api";
import fileUpload from "express-fileupload";
import path from "path";

class CustomError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "CustomError";
    this.status = status;
  }
}

export default ({ app }: { app: express.Application }) => {
  app.use(express.urlencoded({ extended: true }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
  });

  app.use(fileUpload());
  app.use(express.urlencoded({ extended: true }));
  app.use("/image", express.static(path.join(__dirname, "image")));

  app.get("/status", (req, res) => {
    res.status(200).json({ ok: "ok" }).end();
  });

  app.post("/contanct", (req, res) => {});

  app.use(express.json());

  app.use(config.api.prefix, routes());

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (!isCelebrateError(err)) {
      return next(err);
    }

    const errorBody = err.details.get("body");
    const { details } = errorBody;

    const result = {
      statusCode: 400,
      error: "Bad Request",
      message: details[0].message,
    };

    return res.status(400).send({ message: result.message });
  });

  app.use(
    (err: CustomError, req: Request, res: Response, next: NextFunction) => {
      res.status(err.status || 500);
      res.json({
        error: {
          message: err.message,
        },
      });
    }
  );

  app.use(
    (err: CustomError, req: Request, res: Response, next: NextFunction) => {
      if (err.name === "UnauthorizedError") {
        return res.status(err.status).send({ message: err.message }).end();
      }
      return next(err);
    }
  );

  return app;
};
