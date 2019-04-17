import * as dotenv from "dotenv";
import {
  DbService,
  HttpService,
  Server,
  start,
  WebSocketService
} from "serendip";
import { MongodbProvider } from "serendip-mongodb-provider";

import * as fs from "fs-extra";
import { ControllerService } from "./ControllerService";
import { SocketService } from "./SocketService";
import { HttpController } from "./HttpController";


dotenv.config();

Server.dir = __dirname;

DbService.configure({
  defaultProvider: "Mongodb",
  providers: {
    Mongodb: {
      object: new MongodbProvider(),
      options: {
        mongoDb: process.env["db.mongoDb"],
        mongoUrl: process.env["db.mongoUrl"],
        authSource: process.env["db.authSource"],
        user: process.env["db.user"],
        password: process.env["db.password"]
      }
    }
  }
});

HttpService.configure({
  controllers: [HttpController],
  httpPort: parseInt(process.env["http.port"], 10)
});


start({
  logging: (process.env["core.logging"] as any) || "info",
  cpuCores: (process.env["core.cpuCores"] as any) || 1,
  services: [DbService, ControllerService, SocketService, HttpService]
})
  .then(async () => {
    // server started successfully

    console.log(
      "\n\t" +
      new Date().toLocaleString() +
      ` | grid controller started: ${process.env.nodeName}\n`
    );
  })
  .catch(msg => console.log(msg));
