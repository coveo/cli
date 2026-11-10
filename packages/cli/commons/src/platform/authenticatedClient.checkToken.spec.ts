jest.mock('../config/config');
jest.mock('../config/globalConfig');
import {Interfaces} from '@oclif/core';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from './authenticatedClient';
import {Config} from '../config/config';
import globalConfig from '../config/globalConfig';
import type {
  Request as FetchRequest,
  RequestInfo,
  RequestInit,
  Response as FetchResponse,
} from 'undici';

// Node's built-in Request/Response (the classes its fetch uses). The types
// come from undici because this repo's @types/node predates these globals.
const {Request, Response} = globalThis as unknown as {
  Request: typeof FetchRequest;
  Response: typeof FetchResponse;
};

// Unlike authenticatedClient.spec.ts, this spec uses the real
// @coveo/platform-client and Node's built-in fetch/Request, so it checks the
// request that would really go over the wire for the token check.
describe('AuthenticatedClient token check', () => {
  const token = 'my-valid-token';
  let checkTokenRequest: FetchRequest | undefined;

  const respondWith = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {'content-type': 'application/json'},
    });

  // Stands in for the platform: /oauth/check_token only succeeds when the
  // form body really carries the token, like the real endpoint.
  const fakePlatform = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<FetchResponse> => {
    const request = new Request(input, init);
    if (!request.url.includes('/oauth/check_token')) {
      return respondWith({});
    }
    checkTokenRequest = request.clone();
    const body = await request.text();
    return body.includes(`name="token"\r\n\r\n${token}\r\n`)
      ? respondWith({authentication: {username: 'bob@coveo.com'}})
      : respondWith(
          {errorCode: 'INVALID_TOKEN', message: 'Invalid access token.'},
          404
        );
  };

  beforeAll(() => {
    jest.mocked(globalConfig).get.mockReturnValue({
      configDir: 'the_config_dir',
    } as Interfaces.Config);
  });

  beforeEach(() => {
    checkTokenRequest = undefined;
    jest.mocked(Config).mockImplementation(
      () =>
        ({
          get: () => ({
            environment: 'prod',
            region: 'us',
            organization: 'my_org',
            accessToken: token,
          }),
        } as unknown as Config)
    );
    jest.spyOn(globalThis, 'fetch').mockImplementation(fakePlatform);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the token to /oauth/check_token as multipart/form-data', async () => {
    const client = await new AuthenticatedClient().getClient();
    await client.initialize().catch(() => {});

    expect(checkTokenRequest).toBeDefined();
    expect(checkTokenRequest!.method).toBe('POST');
    expect(checkTokenRequest!.headers.get('content-type')).toMatch(
      /^multipart\/form-data; boundary=/
    );
    const body = await checkTokenRequest!.text();
    expect(body).not.toBe('[object FormData]');
    expect(body).toContain(`name="token"\r\n\r\n${token}\r\n`);
  });

  it('reports a valid token as logged in, not expired', async () => {
    expect(await new AuthenticatedClient().isExpired()).toBe(false);
    expect(await getAuthenticationStatus()).toBe(
      AuthenticationStatus.LOGGED_IN
    );
  });
});
