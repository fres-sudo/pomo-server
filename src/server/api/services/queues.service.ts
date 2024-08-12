import { injectable } from "tsyringe";
import RedisClient from "ioredis";
import { config } from "../common/config";
import { Queue, Worker, type Processor } from "bullmq";
/*
@injectable()
export class QueuesServices {
  connection = new RedisClient({ host: "redis", port: 6379 });

  constructor() {}

  createQueue(name: string) {
    return new Queue(name, { connection: this.connection });
  }

  createWorker(name: string, prcoessor: Processor) {
    return new Worker(name, prcoessor, { connection: this.connection });
  }
}
*/
