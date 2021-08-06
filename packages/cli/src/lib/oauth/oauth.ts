import {
  PlatformEnvironment,
  PlatformRegion,
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
import {register} from 'protocol-registry';
import IPC from 'node-ipc';
export interface OAuthOptions {
  port: number;
  environment: PlatformEnvironment;
  region: PlatformRegion;
}

export class OAuth {
  private opts: OAuthOptions;
  public constructor(opts?: Partial<OAuthOptions>) {
    const baseOptions: OAuthOptions = {
      port: 32111,
      environment: 'prod',
      region: 'us-east-1',
    };

    this.opts = {
      environment: opts?.environment || baseOptions.environment,
      port: opts?.port || baseOptions.port,
      region: opts?.region || baseOptions.region,
    };
  }

  public async getToken() {
    IPC.config.silent = true;
    IPC.serve(IPC.config.socketRoot + IPC.config.appspace + 'coveo');
    IPC.server.start();
    await register({
      command: `${process.argv[0]} ${process.argv[1]} auth:redirect $_URL_`,
      protocol: 'baguette',
      override: true,
    });
    const config = new AuthorizationServiceConfiguration({
      ...this.clientConfig,
      ...this.authServiceConfig,
    });
    const code = new Promise<string>((resolve) => {
      IPC.server.on('code', (data) => {
        console.log(data.toString());
        const url = new URL(data.toString());
        IPC.server.stop();
        resolve(url.searchParams.get('code') ?? '');
      });
    });
    this.getAuthorizationCode(config);
    await code;
    console.log(await code);
    return await this.getAccessToken(config, await code);
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
      console.log('ERROR: ', e);
      return e;
    }
  }

  private getAuthorizationCode(
    configuration: AuthorizationServiceConfiguration
  ): void {
    const authorizationHandler = new NodeBasedHandler(this.opts.port);
    const request = new AuthorizationRequest(
      {
        ...this.clientConfig,
        response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
      },
      new NodeCrypto(),
      true
    );

    authorizationHandler.performAuthorizationRequest(configuration, request);
    authorizationHandler.completeAuthorizationRequestIfPossible
  }

  private get clientConfig() {
    return {
      client_id: 'baguettecli',
      redirect_uri: 'baguette://cli-auth',
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
