import axios, {AxiosRequestConfig} from 'axios';
import {cli} from 'cli-ux';
import {readFileSync} from 'fs';
import {IncomingMessage, ServerResponse} from 'http';
import {join} from 'path';
import {EventEmitter} from 'stream';
import {URLSearchParams} from 'url';
import {AuthorizationServiceConfiguration, ClientConfig} from './oauthConfig';

export class ServerEventsEmitter extends EventEmitter {
  public static ON_ACCESS_TOKEN_DELIVERED = 'access_token_delivered';
  public static ON_ERROR = 'on_error';
}

export class RequestHandler {
  public constructor(
    private clientConfig: ClientConfig,
    private authServiceConfig: AuthorizationServiceConfiguration
  ) {}

  public requestListener(expectedState: string, emitter: ServerEventsEmitter) {
    const handler = async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const {code, state} = this.parseUrl(req);
        const {tokenEndpoint} = this.authServiceConfig;

        if (!state || !code) {
          // ignore irrelevant requests (e.g. favicon.ico)
          return;
        }

        // TODO: handle errors

        if (state !== expectedState) {
          cli.error('TODO:Fine a better message here');
        }

        const data = this.getTokenQueryString(code);

        const authRequest = await axios({
          method: 'post',
          url: tokenEndpoint,
          ...this.requestConfig,
          data,
        });
        const accessToken = authRequest.data.access_token;

        emitter.emit(
          ServerEventsEmitter.ON_ACCESS_TOKEN_DELIVERED,
          accessToken
        );
        this.terminateFlow(res);
      } catch (error: unknown) {
        emitter.emit(ServerEventsEmitter.ON_ERROR, error);
      }
    };

    return handler;
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

    return {state, code};
  }

  private terminateFlow(res: ServerResponse) {
    const html = readFileSync(join(__dirname, 'terminator.html'));
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html);
    res.end();
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
