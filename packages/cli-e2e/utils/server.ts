import {IncomingMessage, createServer, ServerResponse, Server} from 'http';
import waitOn from 'wait-on';

export class DummyServer {
  private server: Server;

  public constructor(private port: number) {
    this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
      res.end(`port ${port} taken`);
    });
  }

  public async start() {
    await waitOn({resources: [`tcp:${this.port}`], reverse: true});
    this.server.listen(this.port);
  }

  public close() {
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
