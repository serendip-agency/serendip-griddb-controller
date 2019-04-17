"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const bson_objectid_1 = require("bson-objectid");
class HttpController {
    constructor(controllerService) {
        this.controllerService = controllerService;
        this.ensureIndex = {
            publicAccess: true,
            method: "POST",
            route: "/api/collection/:collection/ensureIndex",
            actions: [
                async (req, res, next, done) => {
                    for (const key in this.controllerService.grid.infs) {
                        if (this.controllerService.grid.infs.hasOwnProperty(key)) {
                            const node = this.controllerService.grid.infs[key];
                            if (node.type == 'peer') {
                                try {
                                    await this.post(node.address, req.url, req.body);
                                }
                                catch (error) {
                                    console.error(error);
                                }
                            }
                        }
                    }
                    done(200);
                }
            ]
        };
        this.dropCollection = {
            publicAccess: true,
            method: "POST",
            route: "/api/collection/:collection/dropCollection",
            actions: [
                async (req, res, next, done) => {
                    for (const key in this.controllerService.grid.infs) {
                        if (this.controllerService.grid.infs.hasOwnProperty(key)) {
                            const node = this.controllerService.grid.infs[key];
                            if (node.type == 'peer') {
                                try {
                                    await this.post(node.address, req.url, req.body);
                                }
                                catch (error) {
                                    console.error(error);
                                }
                            }
                        }
                    }
                    done(200);
                }
            ]
        };
        this.dbStats = {
            publicAccess: true,
            method: "POST",
            route: "/api/db/stats",
            actions: [
                async (req, res, next, done) => {
                    const stats = [];
                    for (const key in this.controllerService.grid.infs) {
                        if (this.controllerService.grid.infs.hasOwnProperty(key)) {
                            const node = this.controllerService.grid.infs[key];
                            if (node.type == 'peer') {
                                try {
                                    stats.push(await this.post(node.address, req.url, req.body));
                                }
                                catch (error) {
                                    console.error(error);
                                }
                            }
                        }
                    }
                    res.json(stats);
                }
            ]
        };
        this.find = {
            publicAccess: true,
            method: "POST",
            route: "/api/collection/:collection/find",
            actions: [
                async (req, res, next, done) => {
                    done(500);
                }
            ]
        };
        this.count = {
            publicAccess: true,
            method: "POST",
            route: "/api/collection/:collection/count",
            actions: [
                async (req, res, next, done) => {
                    let count = 0;
                    for (const key in this.controllerService.grid.infs) {
                        if (this.controllerService.grid.infs.hasOwnProperty(key)) {
                            const node = this.controllerService.grid.infs[key];
                            if (node.type == 'peer') {
                                try {
                                    count += (await this.post(node.address, req.url, req.body));
                                }
                                catch (error) {
                                    console.error(error);
                                }
                            }
                        }
                    }
                    res.json(count);
                }
            ]
        };
        this.insertOne = {
            publicAccess: true,
            method: "POST",
            route: "/api/collection/:collection/insertOne",
            actions: [
                async (req, res, next, done) => {
                    if (req.body.model && !req.body.model._id)
                        req.body.model._id = new bson_objectid_1.default().str;
                    let indexTwin = {};
                    let model;
                    for (const twin of this.controllerService.grid.twins) {
                        for (const nodeName of twin) {
                            const node = this.controllerService.grid.infs[nodeName];
                            try {
                                model = await this.post(node.address, req.url, req.body);
                                indexTwin[nodeName] = true;
                            }
                            catch (error) {
                                indexTwin[nodeName] = false;
                            }
                        }
                        if (!indexTwin[Object.keys(indexTwin)[0]] && !indexTwin[Object.keys(indexTwin)[0]]) {
                            indexTwin = {};
                        }
                        else
                            break;
                    }
                    await this.controllerService.indexing.insertOne({
                        peers: indexTwin,
                        docId: model._id,
                        collection: req.params.collection,
                        business: model._business,
                        entity: model._entity,
                        user: model._vuser
                    });
                    res.json(model);
                }
            ]
        };
        this.updateOne = {
            publicAccess: true,
            method: "POST",
            route: "/api/collection/:collection/updateOne",
            actions: [
                async (req, res, next, done) => {
                    done(500);
                }
            ]
        };
        this.deleteOne = {
            publicAccess: true,
            method: "POST",
            route: "/api/collection/:collection/deleteOne",
            actions: [
                async (req, res, next, done) => {
                    done(500);
                }
            ]
        };
    }
    onRequest(req, res, next) {
        next();
    }
    async post(address, path, model) {
        return new Promise((resolve, reject) => {
            request(address + path, {
                method: "post",
                json: model
            }, (err, res, body) => {
                if (err)
                    return reject(err);
                resolve(body);
            });
        });
    }
}
exports.HttpController = HttpController;
