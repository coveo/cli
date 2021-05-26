import {IncomingMessage, createServer, ServerResponse} from 'http';
import {Server} from 'http';

export class DummyServer {
  private server: Server;

  constructor(port: number) {
    this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
      res.end(`port ${port} taken`);
    }).listen(port);
  }

  async close() {
    return new Promise<void>((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
