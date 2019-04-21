"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
class SocketService {
    constructor(controllerService, httpService) {
        this.controllerService = controllerService;
        this.httpService = httpService;
    }
    async start() {
        this.wss = new WebSocket.Server({
            noServer: true
        });
        this.httpService.httpServer.on("upgrade", (req, socket, head) => {
            if (req.url.indexOf('/sockets/') == 0)
                this.wss.handleUpgrade(req, socket, head, ws => {
                    this.wss.emit('connection', ws, req);
                });
        });
        this.wss.on("connection", (socket, req) => {
            console.log("new socket connection", req.socket.remoteAddress, req.url);
            socket.on("close", (code, reason) => {
                console.log(req.url, code, reason);
            });
            socket.on("message", msg => {
                let data;
                try {
                    data = JSON.parse(msg.toString());
                }
                catch (error) { }
                if (!data)
                    return socket.terminate();
                if (data.type == "secret") {
                    for (const key in this.controllerService.grid.infs) {
                        if (this.controllerService.grid.infs.hasOwnProperty(key)) {
                            const node = this.controllerService.grid.infs[key];
                            if (node.secret == data.model) {
                                socket.nodeName = key;
                                socket.nodeProps = node;
                                socket.send("authenticated");
                                this.controllerService.nodes[key] = socket;
                                break;
                            }
                        }
                    }
                }
                if (data.type != "secret" && !socket.nodeName)
                    return socket.terminate();
                if (data.type == "stat") {
                    socket.nodeStat = data.model;
                    this.controllerService.grid.infs[socket.nodeName].stat = data.model;
                    return;
                }
                console.log(data);
                //  console.log(data);
            });
        });
    }
}
exports.SocketService = SocketService;
