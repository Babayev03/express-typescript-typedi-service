import expressLoader from "./express";
import dependencyInjector from "./dependencyInjector";
import mongooseLoader from "./mongoose";

declare module "express" {
  interface Request {
    token: { _id: string };
  }
}
export default async function loaders({ expressApp }) {
  console.log("✌️ Loaders initiated");

  await mongooseLoader();
  console.log("DB loaded and connected!");

  const userModel = {
    name: "userModel",
    model: require("../models/user").default,
  };

  const worModel = {
    name: "workModel",
    model: require("../models/work").default,
  };

  const blogModel = {
    name: "blogModel",
    model: require("../models/blog").default,
  };

  dependencyInjector([userModel, worModel, blogModel]);
  console.log("✌️ Dependency Injector loaded");

  expressApp = expressLoader({ app: expressApp });
  console.log("✌️ Express loaded");

  return expressApp;
}
