import opener from 'opener';
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_REGION,
  PlatformEnvironment,
  platformUrl,
} from '../platform/environment';
import {Region} from '@coveord/platform-client';
import {randomBytes} from 'crypto';
import {AuthorizationServiceConfiguration, ClientConfig} from './oauthConfig';
import {OauthClientServer} from './oauthClientServer';

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
    const state = this.generateState(10);
    const requestHandler = new OauthClientServer(
      this.clientConfig,
      this.authServiceConfig
    );

    const clientServerPromise = requestHandler.startServer(
      this.opts.port,
      '127.0.0.1',
      state
    );

    this.openLoginPage(state);

    return clientServerPromise;
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
    url.searchParams.append('scope', scope);
    url.searchParams.append('state', state);

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
