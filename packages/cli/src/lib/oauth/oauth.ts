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

export class OAuth {
  constructor(private port: number = 32111) {}

  public async getToken() {
    // TODO: This will always spawn a new browser window/request new token every time
    // Need to use token locally available if possible.
    // CDX-36
    const config = new AuthorizationServiceConfiguration({
      ...this.clientConfig,
      ...this.authServiceConfig,
    });

    const {code} = await this.getAuthorizationCode(config);
    const accessToken = this.getAccessToken(config, code);
    return accessToken;
  }

  private async getAccessToken(
    configuration: AuthorizationServiceConfiguration,
    code: string
  ): Promise<string> {
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
      // TODO: Save access token/refresh token in CLI config
      // CDX-37
      return response.accessToken;
    } catch (e) {
      console.log('ERROR: ', e);
      return e;
    }
  }

  private getAuthorizationCode(
    configuration: AuthorizationServiceConfiguration
  ): Promise<{code: string; verifier: string}> {
    return new Promise((res) => {
      const notifier = new AuthorizationNotifier();
      const authorizationHandler = new NodeBasedHandler(this.port);
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
      redirect_uri: `http://127.0.0.1:${this.port}`,
      scope: 'full',
    };
  }

  private get authServiceConfig(): AuthorizationServiceConfigurationJson {
    // TODO: Support for different platform environment (dev,qa,prd,hip) and regions.
    // Should be stored in CLI config ?
    // CDX-36
    return {
      authorization_endpoint:
        'https://platformdev.cloud.coveo.com/oauth/authorize',
      revocation_endpoint: 'https://platformdev.cloud.coveo.com/logout',
      token_endpoint: 'https://platformdev.cloud.coveo.com/oauth/token',
    };
  }
}
