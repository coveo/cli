import opener from 'opener';
import {
  AuthorizationRequestHandler,
  AuthorizationRequestResponse,
  QueryStringUtils,
  Crypto,
  BasicQueryStringUtils,
  AuthorizationServiceConfiguration,
  AuthorizationRequest,
  log,
  AuthorizationResponse,
  AuthorizationError,
} from '@openid/appauth';
import {NodeCrypto} from '@openid/appauth/built/node_support';
import IPC from 'node-ipc';
import {register as protocolRegister} from 'protocol-registry';
import dedent from 'ts-dedent';

export class IPCBasedHandler extends AuthorizationRequestHandler {
  // the handle to the current authorization request
  public authorizationPromise: Promise<AuthorizationRequestResponse | null> | null =
    null;
  public ipcServerAdress: string;

  public constructor(
    utils: QueryStringUtils = new BasicQueryStringUtils(),
    crypto: Crypto = new NodeCrypto()
  ) {
    super(utils, crypto);
    this.ipcServerAdress =
      IPC.config.socketRoot + IPC.config.appspace + 'coveo';
  }

  public async performAuthorizationRequest(
    configuration: AuthorizationServiceConfiguration,
    request: AuthorizationRequest
  ) {
    IPC.config.silent = true;
    try {
      IPC.serve(this.ipcServerAdress);
      IPC.server.start();
    } catch (error) {
      throw dedent`Unable to create IPC server at ${this.ipcServerAdress}:
            ${error}`;
    }

    await protocolRegister({
      command: `"${process.argv[0]}" "${process.argv[1]}" "auth:redirect" "$_URL_"`,
      terminal: false,
      protocol: 'baguette',
      override: true,
    });

    this.authorizationPromise = new Promise<AuthorizationRequestResponse>(
      (resolve) => {
        IPC.server.on('code', (data) => {
          IPC.server.stop();
          const url = new URL(data.toString());
          const searchParams = url.searchParams;

          const state = searchParams.get('state') || undefined;
          const code = searchParams.get('code');
          const error = searchParams.get('error');

          if (!state && !code && !error) {
            // ignore irrelevant requests (e.g. favicon.ico)
            return;
          }

          log(
            'Handling Authorization Request ',
            searchParams,
            state,
            code,
            error
          );
          let authorizationResponse: AuthorizationResponse | null = null;
          let authorizationError: AuthorizationError | null = null;
          if (error) {
            log('error');
            // get additional optional info.
            const errorUri = searchParams.get('error_uri') || undefined;
            const errorDescription =
              searchParams.get('error_description') || undefined;
            authorizationError = new AuthorizationError({
              error: error,
              error_description: errorDescription,
              error_uri: errorUri,
              state: state,
            });
          } else {
            authorizationResponse = new AuthorizationResponse({
              code: code!,
              state: state!,
            });
          }
          resolve({
            request,
            response: authorizationResponse,
            error: authorizationError,
          });
        });
      }
    );
    this.authorizationPromise.then(() =>
      this.completeAuthorizationRequestIfPossible()
    );
    request.setupCodeVerifier().then(() => {
      const url = this.buildRequestUrl(configuration, request);
      log('Making a request to ', request, url);
      opener(url);
    });
  }

  protected completeAuthorizationRequest(): Promise<AuthorizationRequestResponse | null> {
    if (!this.authorizationPromise) {
      return Promise.reject(
        'No pending authorization request. Call performAuthorizationRequest() ?'
      );
    }

    return this.authorizationPromise;
  }
}
