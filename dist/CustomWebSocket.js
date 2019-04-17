"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
class CustomWebSocket extends WebSocket {
    constructor() {
        super(...arguments);
        this.nodeName = "";
    }
}
exports.CustomWebSocket = CustomWebSocket;
