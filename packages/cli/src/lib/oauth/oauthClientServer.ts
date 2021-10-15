import axios, {AxiosRequestConfig} from 'axios';
import {createServer, IncomingMessage, Server, ServerResponse} from 'http';
import {URLSearchParams} from 'url';
import {AuthorizationError, InvalidStateError} from './authorizationError';
import {AuthorizationServiceConfiguration, ClientConfig} from './oauthConfig';

interface AccessTokenResponse {
  access_token: string;
}

export class OAuthClientServer {
  public constructor(
    private clientConfig: ClientConfig,
    private authServiceConfig: AuthorizationServiceConfiguration
  ) {}

  public startServer(port: number, hostname: string, expectedState: string) {
    let server: Server;
    const serverPromise = new Promise<{accessToken: string}>(
      (resolve, reject) => {
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
            const authRequest = await axios.post<AccessTokenResponse>(
              tokenEndpoint,
              data,
              this.requestConfig
            );
            const accessToken = authRequest.data.access_token;

            res.end('Close your browser to continue');
            resolve({accessToken});
          } catch (error: unknown) {
            reject(error);
          } finally {
            server.close();
          }
        };

        server = createServer(listener);
        server.listen(port, hostname);
      }
    );

    return serverPromise;
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
