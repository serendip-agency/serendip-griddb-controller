"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
class ControllerService {
    constructor(dbService) {
        this.dbService = dbService;
        this.nodes = {};
    }
    async start() {
        this.indexing = await this.dbService.collection("Indexing", false);
        this.log = await this.dbService.collection("Log", false);
        this.grid = await fs.readJSON(".grid.json");
        await this.log.insertOne({
            nodeName: process.env.nodeName,
            startDate: new Date(),
            gridConfig: this.grid
        });
    }
}
exports.ControllerService = ControllerService;
