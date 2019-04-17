import * as WebSocket from "ws";

export class CustomWebSocket extends WebSocket {
  public nodeProps: any;
  public nodeName: string = "";
  public nodeStat: {
    db: string;
    collections: number;
    indexes: number;
    avgObjSizeByte: number;
    objects: number;
    storageMB: number;
    fsUsedMB: number;
    fsTotalMB: number;
  };
}
