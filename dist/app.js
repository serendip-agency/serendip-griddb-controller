"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const serendip_1 = require("serendip");
const serendip_mongodb_provider_1 = require("serendip-mongodb-provider");
const ControllerService_1 = require("./ControllerService");
const SocketService_1 = require("./SocketService");
const HttpController_1 = require("./HttpController");
dotenv.config();
serendip_1.Server.dir = __dirname;
serendip_1.DbService.configure({
    defaultProvider: "Mongodb",
    providers: {
        Mongodb: {
            object: new serendip_mongodb_provider_1.MongodbProvider(),
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
serendip_1.HttpService.configure({
    controllers: [HttpController_1.HttpController],
    httpPort: parseInt(process.env["http.port"], 10)
});
serendip_1.start({
    logging: process.env["core.logging"] || "info",
    cpuCores: process.env["core.cpuCores"] || 1,
    services: [serendip_1.DbService, ControllerService_1.ControllerService, SocketService_1.SocketService, serendip_1.HttpService]
})
    .then(async () => {
    // server started successfully
    console.log("\n\t" +
        new Date().toLocaleString() +
        ` | grid controller started: ${process.env.nodeName}\n`);
})
    .catch(msg => console.log(msg));
