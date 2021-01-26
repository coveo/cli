import {
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
} from '@openid/appauth';
import {NodeBasedHandler} from '@openid/appauth/built/node_support';
import {OAuth} from './oauth';

jest.mock('@openid/appauth/built/node_support');

jest.mock('@openid/appauth', () => ({
  AuthorizationServiceConfiguration: jest.fn().mockImplementation(() => {}),
  AuthorizationNotifier: jest.fn().mockImplementation(() => ({
    setAuthorizationListener: (cb: Function) => {
      cb({internal: {verifier: 'the-verifier'}}, {code: 'the-code'}, null);
    },
  })),
  AuthorizationRequest: jest.fn().mockImplementation(() => {}),
  TokenRequest: jest.fn().mockImplementation(() => {}),
  BaseTokenRequestHandler: jest.fn().mockImplementation(() => ({
    performTokenRequest: () =>
      Promise.resolve({
        accessToken: 'the-access-token',
        refreshToken: 'the-refresh-token',
      }),
  })),
}));

describe('OAuth', () => {
  it('should return the access token when requested', async () => {
    (BaseTokenRequestHandler as jest.Mock).mockImplementationOnce(() => ({
      performTokenRequest: () =>
        Promise.resolve({
          accessToken: 'this-is-the-new-access-token',
          refreshToken: 'the-refresh-token',
        }),
    }));
    const token = await new OAuth().getToken();
    expect(token).toEqual('this-is-the-new-access-token');
  });

  it('should use configured port to pass to @openid', async () => {
    await new OAuth(444).getToken();
    expect(NodeBasedHandler).toHaveBeenCalledWith(444);
  });

  it('should use proper config for @openid AuthorizationServiceConfiguration', async () => {
    await new OAuth(1234).getToken();
    expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'cli',
        redirect_uri: 'http://127.0.0.1:1234',
        scope: 'full',
        authorization_endpoint:
          'https://platformdev.cloud.coveo.com/oauth/authorize',
        revocation_endpoint: 'https://platformdev.cloud.coveo.com/logout',
        token_endpoint: 'https://platformdev.cloud.coveo.com/oauth/token',
      })
    );
  });
});
