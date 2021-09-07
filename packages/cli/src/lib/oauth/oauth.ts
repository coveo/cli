import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_REGION,
  PlatformEnvironment,
  platformUrl,
} from '../platform/environment';
import {
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationServiceConfiguration,
  AuthorizationServiceConfigurationJson,
  BaseTokenRequestHandler,
  GRANT_TYPE_AUTHORIZATION_CODE,
  TokenRequest,
} from '@openid/appauth';
import {
  NodeBasedHandler,
  NodeCrypto,
  NodeRequestor,
} from '@openid/appauth/built/node_support';
import {Region} from '@coveord/platform-client';

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
    const config = new AuthorizationServiceConfiguration({
      ...this.clientConfig,
      ...this.authServiceConfig,
    });

    const {code} = await this.getAuthorizationCode(config);
    return await this.getAccessToken(config, code);
  }

  private async getAccessToken(
    configuration: AuthorizationServiceConfiguration,
    code: string
  ): Promise<{accessToken: string}> {
    const tokenHandler = new BaseTokenRequestHandler(new NodeRequestor());

    const request = new TokenRequest({
      ...this.clientConfig,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code,
      extras: {
        client_secret: this.clientConfig.client_id,
      },
    });

    try {
      const response = await tokenHandler.performTokenRequest(
        configuration,
        request
      );
      return response;
    } catch (e) {
      console.error('ERROR: ', e as string);
      throw e;
    }
  }

  private getAuthorizationCode(
    configuration: AuthorizationServiceConfiguration
  ): Promise<{code: string; verifier: string}> {
    return new Promise((res) => {
      const notifier = new AuthorizationNotifier();
      const authorizationHandler = new NodeBasedHandler(this.opts.port);
      const request = new AuthorizationRequest(
        {
          ...this.clientConfig,
          response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
        },
        new NodeCrypto(),
        true
      );

      authorizationHandler.setAuthorizationNotifier(notifier);
      notifier.setAuthorizationListener((request, response) => {
        if (response) {
          const {code} = response;
          res({code, verifier: request.internal!.verifier});
        }
      });
      authorizationHandler.performAuthorizationRequest(configuration, request);
    });
  }

  private get clientConfig() {
    return {
      client_id: 'cli',
      redirect_uri: `http://127.0.0.1:${this.opts.port}`,
      scope: 'full',
    };
  }

  private get authServiceConfig(): AuthorizationServiceConfigurationJson {
    const baseURL = platformUrl({
      environment: this.opts.environment,
      region: this.opts.region,
    });
    return {
      authorization_endpoint: `${baseURL}/oauth/authorize`,
      revocation_endpoint: `${baseURL}/logout`,
      token_endpoint: `${baseURL}/oauth/token`,
    };
  }
}
