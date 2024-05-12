import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { Server } from "http";
import config from "./config";
import loaders from "./loaders";

async function startServer() {
  const app = express();
  const expressApp = await loaders({ expressApp: app });
  const httpServer = new Server(expressApp);

  httpServer
    .listen(config.port, () => {
      console.log(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `);
    })
    .on("error", (err: Error) => {
      console.log("app start error", err);
    });
}

startServer();
