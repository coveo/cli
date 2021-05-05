import {CDPSession, ConsoleMessageType, Page} from 'puppeteer';
import {FileLogger} from './terminal/terminal';
import type {Runtime} from 'node:inspector';

export class ConsoleInterceptor {
  private _client: CDPSession | null = null;
  public interceptedMessages: string[] = [];

  constructor(private page: Page, private interceptorName: string) {}

  private async init() {
    this._client = await this.page.target().createCDPSession();
    await this._client.send('Runtime.enable');
    return this._client;
  }

  private async getClient(): Promise<CDPSession> {
    return this._client || (await this.init());
  }

  public async startSession(
    typesToIntercept: ConsoleMessageType[] = ['error', 'warning']
  ) {
    const fileLogger = new FileLogger(
      `console${
        this.interceptorName ? '-' + this.interceptorName : ''
      }`.replace(/[^\w\d]/g, '-')
    );

    const client = await this.getClient();
    client.on(
      'Runtime.consoleAPICalled',
      (message: Runtime.ConsoleAPICalledEventDataType) => {
        if (typesToIntercept.indexOf(message.type as ConsoleMessageType) > -1) {
          message.args.forEach((arg) => {
            if (arg.description) {
              this.interceptedMessages.push(arg.description);
              fileLogger[message.type === 'error' ? 'stderr' : 'stdout'].write(
                arg.description
              );
            }
          });
        }
      }
    );
  }

  public async endSession() {
    const client = await this.getClient();
    client.removeAllListeners('Runtime.consoleAPICalled');
    this.interceptedMessages = [];
  }
}
