import {
    HttpControllerInterface,
    HttpEndpointInterface,
    DbService
} from "serendip";
import { DbCollectionInterface } from "serendip-business-model";
import * as request from "request";
import { ControllerService } from "./ControllerService";
import ObjectID, * as ObjectId from 'bson-objectid';
import { SocketService } from "./SocketService";
export class HttpController implements HttpControllerInterface {
    constructor(private controllerService: ControllerService) { }
    onRequest(req, res, next) {
        next();
    }

    private async post(address: string, path: string, model: any) {
        return new Promise((resolve, reject) => {
            request(
                address + path,
                {
                    method: "post",
                    json: model
                },
                (err, res, body) => {
                    if (err) return reject(err);

                    resolve(body);
                }
            );
        })
    }
    public ensureIndex: HttpEndpointInterface = {
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

                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
                }
                done(200);
            }
        ]
    };

    public dropCollection: HttpEndpointInterface = {
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

                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
                }
                done(200);


            }
        ]
    };

    public dbStats: HttpEndpointInterface = {
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

                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
                }
                res.json(stats);

            }
        ]
    };

    public find: HttpEndpointInterface = {
        publicAccess: true,
        method: "POST",
        route: "/api/collection/:collection/find",
        actions: [
            async (req, res, next, done) => {

                if (!req.body.skip)
                    req.body.skip = 0;

                if (!req.body.limit)
                    req.body.limit = 0;

                let models = [];
                for (const twin of this.controllerService.grid.twins) {
                    for (const nodeName of twin) {
                        let count = 0;
                        const node = this.controllerService.grid.infs[nodeName];
                        try {

                            count += (await this.post(node.address, req.url, req.body)) as any;


                            if (count < req.body.skip) {
                                req.body.skip -= count;
                                break;
                            }


                            models = models.concat(await this.post(node.address, req.url, req.body));

                            break;
                        } catch (error) {
                        }
                    }
                }
                res.json(models);
            }
        ]
    };

    public count: HttpEndpointInterface = {
        publicAccess: true,
        method: "POST",
        route: "/api/collection/:collection/count",
        actions: [
            async (req, res, next, done) => {

                let count = 0;

                for (const twin of this.controllerService.grid.twins) {
                    for (const nodeName of twin) {
                        const node = this.controllerService.grid.infs[nodeName];
                        try {
                            count += (await this.post(node.address, req.url, req.body)) as any;
                            break;
                        } catch (error) {
                        }
                    }
                }

                res.json(count);

            }
        ]
    };

    public insertOne: HttpEndpointInterface = {
        publicAccess: true,
        method: "POST",
        route: "/api/collection/:collection/insertOne",
        actions: [
            async (req, res, next, done) => {
                if (req.body.model && !req.body.model._id)
                    req.body.model._id = new ObjectID().str;

                let indexTwin = {};

                let model;
                for (const twin of this.controllerService.grid.twins) {


                    for (const nodeName of twin) {

                        const nodeStat = this.controllerService.grid.infs[nodeName].stat;
                        console.log(this.controllerService.grid.infs[nodeName].hard * 1024, nodeStat.storageMB);
                        if (this.controllerService.grid.infs[nodeName].hard * 1024 <= nodeStat.storageMB) {

                            console.log('node is full', nodeStat);
                            break;

                        }


                        const node = this.controllerService.grid.infs[nodeName];
                        try {
                            model = await this.post(node.address, req.url, req.body);
                            indexTwin[nodeName] = true;
                        } catch (error) {
                            indexTwin[nodeName] = false;

                        }
                    }
                    if (!indexTwin[Object.keys(indexTwin)[0]] && !indexTwin[Object.keys(indexTwin)[0]]) {
                        indexTwin = {};
                    } else
                        break;
                }

                if (model && model._id) {
                    await this.controllerService.indexing.insertOne({
                        peers: indexTwin,
                        docId: model._id,
                        type: 'insert',
                        collection: req.params.collection,
                        business: model._business,
                        entity: model._entity,
                        user: model._vuser
                    });

                    res.json(model);

                } else {
                    done(500);
                }
            }
        ]
    };

    public updateOne: HttpEndpointInterface = {
        publicAccess: true,
        method: "POST",
        route: "/api/collection/:collection/updateOne",
        actions: [
            async (req, res, next, done) => {

                if (req.body.model && !req.body.model._id)
                    req.body.model._id = new ObjectID().str;

                let indexTwin = {};

                let model;
                for (const twin of this.controllerService.grid.twins) {
                    for (const nodeName of twin) {
                        const node = this.controllerService.grid.infs[nodeName];
                        try {
                            model = await this.post(node.address, req.url, req.body);
                            indexTwin[nodeName] = true;
                        } catch (error) {
                            indexTwin[nodeName] = false;

                        }
                    }
                    if (!indexTwin[Object.keys(indexTwin)[0]] && !indexTwin[Object.keys(indexTwin)[0]]) {
                        indexTwin = {};
                    } else
                        break;
                }

                await this.controllerService.indexing.insertOne({
                    peers: indexTwin,
                    docId: model._id,
                    type: 'update',
                    collection: req.params.collection,
                    business: model._business,
                    entity: model._entity,
                    user: model._vuser
                });

                res.json(model);
            }
        ]
    };

    public deleteOne: HttpEndpointInterface = {
        publicAccess: true,
        method: "POST",
        route: "/api/collection/:collection/deleteOne",
        actions: [
            async (req, res, next, done) => {

                let indexTwin = {};
                let model;
                for (const twin of this.controllerService.grid.twins) {
                    for (const nodeName of twin) {
                        const node = this.controllerService.grid.infs[nodeName];
                        try {
                            model = await this.post(node.address, req.url, req.body);
                            indexTwin[nodeName] = true;
                        } catch (error) {
                            indexTwin[nodeName] = false;

                        }
                    }
                    if (!indexTwin[Object.keys(indexTwin)[0]] && !indexTwin[Object.keys(indexTwin)[0]]) {
                        indexTwin = {};
                    } else
                        break;
                }
                await this.controllerService.indexing.insertOne({
                    peers: indexTwin,
                    docId: model._id,
                    type: 'delete',
                    collection: req.params.collection,
                    business: model._business,
                    entity: model._entity,
                    user: model._vuser
                });

                res.json(model);
            }
        ]
    };


}
