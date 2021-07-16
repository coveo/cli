import {CDPSession, Page} from 'puppeteer';
import type Protocol from 'devtools-protocol';
import {FileLogger} from './filelogger';

type ConsoleAPICalledEventType = Protocol.Runtime.ConsoleAPICalledEvent['type'];
type ConsoleAPICalledEvent = Protocol.Runtime.ConsoleAPICalledEvent;

export class BrowserConsoleInterceptor {
  private _client: CDPSession | null = null;
  private fileLogger: FileLogger;
  public interceptedMessages: string[] = [];
  private pendingLog: Promise<void>;

  public constructor(private page: Page, private interceptorName: string) {
    this.fileLogger = new FileLogger(
      `console${
        this.interceptorName ? '-' + this.interceptorName : ''
      }`.replace(/[^\w\d]/g, '-')
    );
    this.pendingLog = Promise.resolve();
  }

  private async init() {
    this._client = await this.page.target().createCDPSession();
    await this._client.send('Runtime.enable');
    return this._client;
  }

  private async getClient(): Promise<CDPSession> {
    return this._client || (await this.init());
  }

  public async startSession(
    typesToIntercept: ConsoleAPICalledEventType[] = ['error', 'warning']
  ) {
    const client = await this.getClient();
    client.on('Runtime.consoleAPICalled', (message: ConsoleAPICalledEvent) =>
      this.onClient(message, typesToIntercept)
    );
  }

  private onClient(
    message: ConsoleAPICalledEvent,
    typesToIntercept: ConsoleAPICalledEventType[]
  ) {
    if (typesToIntercept.some((type) => type === message.type)) {
      message.args.forEach((arg) => {
        if (arg.description) {
          this.interceptedMessages.push(arg.description);
          this.logMessage(arg.description, message.type);
        }
      });
    }
  }

  private logMessage(message: string, type: string) {
    const stream = this.fileLogger[type === 'error' ? 'stderr' : 'stdout'];
    this.pendingLog.then(
      () =>
        new Promise<void>((resolve) => {
          if (!stream.write(stream.write(`${Date.now()}: ${message}`))) {
            stream.once('drain', () => resolve());
          } else {
            process.nextTick(() => resolve);
          }
        })
    );
  }

  public async endSession() {
    const client = await this.getClient();
    client.removeAllListeners('Runtime.consoleAPICalled');
    this.interceptedMessages = [];
    await this.pendingLog;
  }
}
