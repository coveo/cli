import {CDPSession, Page} from 'puppeteer';
import {FileLogger} from './terminal/terminal';
import {Protocol} from 'devtools-protocol';

type ConsoleAPICalledEventType = Protocol.Runtime.ConsoleAPICalledEventType;
type ConsoleAPICalledEvent = Protocol.Runtime.ConsoleAPICalledEvent;

export class BrowserConsoleInterceptor {
  private _client: CDPSession | null = null;
  private fileLogger: FileLogger;
  public interceptedMessages: string[] = [];

  constructor(private page: Page, private interceptorName: string) {
    this.fileLogger = new FileLogger(
      `console${
        this.interceptorName ? '-' + this.interceptorName : ''
      }`.replace(/[^\w\d]/g, '-')
    );
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
    typesToIntercept: ConsoleAPICalledEventType[] = [
      Protocol.Runtime.ConsoleAPICalledEventType.Error,
      Protocol.Runtime.ConsoleAPICalledEventType.Warning,
    ]
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
    this.fileLogger[type === 'error' ? 'stderr' : 'stdout'].write(message);
  }

  public async endSession() {
    const client = await this.getClient();
    client.removeAllListeners('Runtime.consoleAPICalled');
    this.interceptedMessages = [];
  }
}
