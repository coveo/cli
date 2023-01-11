import open from 'open';
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_REGION,
  PlatformEnvironment,
  platformUrl,
} from '@coveo/cli-commons/platform/environment';
import {Region} from '@coveo/platform-client';
import {randomBytes} from 'crypto';
import {AuthorizationServiceConfiguration, ClientConfig} from './oauthConfig';
import {OAuthClientServer} from './oauthClientServer';
import {URL} from 'url';
import getPort from 'get-port';
import {OAuthPortBusy} from './authorizationError';

interface OAuthOptions {
  environment: PlatformEnvironment;
  region: Region;
}

export class OAuth {
  private static readonly AllowedPorts = [32111, 52296];

  private opts: OAuthOptions;
  private _port: number | undefined = undefined;

  public constructor(opts?: Partial<OAuthOptions>) {
    const baseOptions: OAuthOptions = {
      environment: DEFAULT_ENVIRONMENT,
      region: DEFAULT_REGION,
    };

    this.opts = {
      environment: opts?.environment || baseOptions.environment,
      region: opts?.region || baseOptions.region,
    };
  }

  public async getToken() {
    const state = this.generateState(10);
    const requestHandler = new OAuthClientServer(
      await this.getClientConfig(),
      this.authServiceConfig
    );

    const clientServerPromise = requestHandler.startServer(
      await this.getPort(),
      '127.0.0.1',
      state
    );

    await this.openLoginPage(state);

    return clientServerPromise;
  }

  private async openLoginPage(state: string) {
    const url = await this.buildAuthorizationUrl(state);
    open(url).then((browserProcess) => {
      browserProcess.unref();
    });
  }

  private async buildAuthorizationUrl(state: string) {
    const {authorizationEndpoint} = this.authServiceConfig;
    const {redirect_uri, client_id, scope} = await this.getClientConfig();
    const url = new URL(authorizationEndpoint);

    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', client_id);
    url.searchParams.append('redirect_uri', redirect_uri);
    url.searchParams.append('scope', scope);
    url.searchParams.append('state', state);

    return url.href;
  }

  private generateState(size: number) {
    return randomBytes(size).toString('hex');
  }

  private async getClientConfig(): Promise<ClientConfig> {
    return {
      client_id: 'cli',
      redirect_uri: `http://127.0.0.1:${await this.getPort()}`,
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

  private async getPort(): Promise<number> {
    if (!this._port) {
      const candidate = await getPort({port: OAuth.AllowedPorts});
      if (!OAuth.AllowedPorts.includes(candidate)) {
        throw new OAuthPortBusy();
      }
      this._port = candidate;
    }
    return this._port;
  }
}
