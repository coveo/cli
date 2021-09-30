import opener from 'opener';
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_REGION,
  PlatformEnvironment,
  platformUrl,
} from '../platform/environment';
import {Region} from '@coveord/platform-client';
import {randomBytes} from 'crypto';
import {createServer} from 'http';
import {AuthorizationServiceConfiguration, ClientConfig} from './oauthConfig';
import {RequestHandler, ServerEventsEmitter} from './requestHandler';
import {cli} from 'cli-ux';

export interface OAuthOptions {
  port: number;
  environment: PlatformEnvironment;
  region: Region;
}

export class OAuth {
  private opts: OAuthOptions;

  public constructor(opts?: Partial<OAuthOptions>) {
    const baseOptions: OAuthOptions = {
      port: 32111,
      environment: DEFAULT_ENVIRONMENT,
      region: DEFAULT_REGION,
    };

    this.opts = {
      environment: opts?.environment || baseOptions.environment,
      port: opts?.port || baseOptions.port,
      region: opts?.region || baseOptions.region,
    };
  }

  public async getToken() {
    cli.info('generateState');
    const state = this.generateState(10);
    cli.info('startClientServer. state: ' + state);
    const token = this.startClientServer(state);
    cli.info('open login page');
    this.openLoginPage(state);

    return token;
  }

  private async startClientServer(state: string): Promise<{
    accessToken: string;
  }> {
    const emitter = new ServerEventsEmitter();
    const requestHandler = new RequestHandler(
      this.clientConfig,
      this.authServiceConfig
    );
    const requestListener = requestHandler.requestListener(state, emitter);
    const server = createServer(requestListener);

    cli.log('listening on port ' + this.opts.port);
    server.listen(this.opts.port, '127.0.0.1');

    const accessToken = await new Promise<string>((resolve, reject) => {
      emitter.once(
        ServerEventsEmitter.ON_ACCESS_TOKEN_DELIVERED,
        (token: string) => {
          server.close();
          resolve(token);
        }
      );
      emitter.once(ServerEventsEmitter.ON_ERROR, (err: unknown) => {
        server.close();
        reject(err); // TODO: not sure that is the best way here
      });
    });

    return {accessToken};
  }

  private openLoginPage(state: string) {
    const url = this.buildAuthorizationUrl(state);
    opener(url);
  }

  private buildAuthorizationUrl(state: string) {
    const {authorizationEndpoint} = this.authServiceConfig;
    const {redirect_uri, client_id, scope} = this.clientConfig;
    const url = new URL(authorizationEndpoint);

    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', client_id);
    url.searchParams.append('redirect_uri', redirect_uri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', scope);

    return url.href;
  }

  private generateState(size: number) {
    return randomBytes(size).toString('hex');
  }

  private get clientConfig(): ClientConfig {
    return {
      client_id: 'cli',
      redirect_uri: `http://127.0.0.1:${this.opts.port}`,
      scope: 'full',
    };
  }

  private get authServiceConfig(): AuthorizationServiceConfiguration {
    const baseURL = platformUrl({
      environment: this.opts.environment,
      region: this.opts.region,
    });
    return {
      authorizationEndpoint: `${baseURL}/oauth/authorize`,
      revocationEndpoint: `${baseURL}/logout`,
      tokenEndpoint: `${baseURL}/oauth/token`,
    };
  }
}
