import { ServerServiceInterface, HttpService } from "serendip";
import * as WebSocket from "ws";
import { ControllerService } from "./ControllerService";
import { CustomWebSocket } from "./CustomWebSocket";

export class SocketService implements ServerServiceInterface {
  wss: WebSocket.Server;

  constructor(private controllerService: ControllerService, private httpService: HttpService) { }
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


    this.wss.on("connection", (socket: CustomWebSocket, req) => {
      console.log("new socket connection", req.socket.remoteAddress, req.url);

      socket.on("close", (code, reason) => {
        console.log(req.url, code, reason);
      });
      socket.on("message", msg => {
        let data;
        try {
          data = JSON.parse(msg.toString());
        } catch (error) { }

        if (!data) return socket.terminate();


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
          return;
        }

        console.log(data);

        //  console.log(data);
      });
    });
  }
}
