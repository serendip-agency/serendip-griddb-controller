import { ServerServiceInterface, DbService } from "serendip";
import { DbCollectionInterface } from "serendip-business-model";
import * as fs from "fs-extra";
import { CustomWebSocket } from "./CustomWebSocket";

export class ControllerService implements ServerServiceInterface {
  public indexing: DbCollectionInterface<any>;
  public log: DbCollectionInterface<any>;
  public grid: {
    infs: {
      [key: string]: {
        hard: number;
        address: string;
        type: string;
        secret: string;
        stat: {
          db: string;
          collections: number;
          indexes: number;
          avgObjSizeByte: number;
          objects: number;
          storageMB: number;
          fsUsedMB: number;
          fsTotalMB: number;
        }
      };
    };
    twins: string[][]
  };
  nodes: { [key: string]: CustomWebSocket } = {};
  constructor(private dbService: DbService) { }

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
