import axios, {AxiosRequestConfig} from 'axios';
import {cli} from 'cli-ux';
import {createServer, IncomingMessage, ServerResponse} from 'http';
import {URLSearchParams} from 'url';
import {AuthorizationError, InvalidStateError} from './authorizationError';
import {AuthorizationServiceConfiguration, ClientConfig} from './oauthConfig';

export class OauthClientServer {
  public constructor(
    private clientConfig: ClientConfig,
    private authServiceConfig: AuthorizationServiceConfiguration
  ) {}

  public startServer(port: number, hostname: string, expectedState: string) {
    return new Promise<{accessToken: string}>((resolve, reject) => {
      const listener = async (req: IncomingMessage, res: ServerResponse) => {
        try {
          const {code, state} = this.parseUrl(req);
          const {tokenEndpoint} = this.authServiceConfig;

          if (!state || !code) {
            return;
          }

          if (state !== expectedState) {
            throw new InvalidStateError(state, expectedState);
          }

          const data = this.getTokenQueryString(code);
          const authRequest = await axios({
            method: 'post',
            url: tokenEndpoint,
            ...this.requestConfig,
            data,
          });
          const accessToken = authRequest.data.access_token;

          res.end('Close your browser to continue');
          resolve({accessToken});
          server.close();
        } catch (error: unknown) {
          reject(error);
          server.close();
        }
      };

      const server = createServer(listener);
      server.listen(port, hostname);
    });
  }

  private get requestConfig(): AxiosRequestConfig {
    const {client_id} = this.clientConfig;
    const config: AxiosRequestConfig = {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      auth: {
        username: client_id,
        password: client_id,
      },
    };
    const proxy = process.env.HTTPS_PROXY;
    if (proxy) {
      cli.info(`using proxy ${proxy}`);
      const proxyUrl = new URL(proxy);
      config.proxy = {
        host: proxyUrl.host,
        port: parseInt(proxyUrl.port),
      };
    }

    return config;
  }

  private parseUrl(req: IncomingMessage) {
    if (!req.url) {
      return {
        state: null,
        code: null,
      };
    }

    const url = new URL(`http://127.0.0.1${req.url}`);
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      throw new AuthorizationError(url);
    }

    return {state, code};
  }

  private getTokenQueryString(code: string) {
    const {redirect_uri} = this.clientConfig;
    const params = {
      grant_type: 'authorization_code',
      redirect_uri,
      code,
    };

    return new URLSearchParams(params);
  }
}
