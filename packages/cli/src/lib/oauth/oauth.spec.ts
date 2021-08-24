import {Region} from '@coveord/platform-client';
import {
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
} from '@openid/appauth';
import {NodeBasedHandler} from '@openid/appauth/built/node_support';
import {PlatformEnvironment, platformUrl} from '../platform/environment';
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
      }),
  })),
}));

describe('OAuth', () => {
  it('should return the access token when requested', async () => {
    (BaseTokenRequestHandler as jest.Mock).mockImplementationOnce(() => ({
      performTokenRequest: () =>
        Promise.resolve({
          accessToken: 'this-is-the-new-access-token',
        }),
    }));
    const {accessToken} = await new OAuth().getToken();
    expect(accessToken).toEqual('this-is-the-new-access-token');
  });

  describe('should use proper port for @openid', () => {
    it('using default port', async () => {
      await new OAuth().getToken();
      expect(NodeBasedHandler).toHaveBeenCalledWith(32111);
    });

    it('using configured port', async () => {
      await new OAuth({port: 444}).getToken();
      expect(NodeBasedHandler).toHaveBeenCalledWith(444);
    });
  });

  describe('should use proper @openid AuthorizationServiceConfiguration', () => {
    const endpoints = (opts?: {
      environment?: PlatformEnvironment;
      region?: Region;
    }) => ({
      authorization_endpoint: `${platformUrl(opts)}/oauth/authorize`,
      revocation_endpoint: `${platformUrl(opts)}/logout`,
      token_endpoint: `${platformUrl(opts)}/oauth/token`,
    });

    it('in prod', async () => {
      const opts = {environment: PlatformEnvironment.Prod};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'cli',
          redirect_uri: 'http://127.0.0.1:32111',
          scope: 'full',
          ...endpoints(opts),
        })
      );
    });

    it('in qa', async () => {
      const opts = {environment: PlatformEnvironment.QA};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints(opts),
        })
      );
    });

    it('in dev', async () => {
      const opts = {environment: PlatformEnvironment.Dev};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints(opts),
        })
      );
    });

    it('in hipaa', async () => {
      const opts = {environment: PlatformEnvironment.QA};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints(opts),
        })
      );
    });

    it('in Europe', async () => {
      const opts = {region: Region.EU};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints(opts),
        })
      );
    });

    it('it should be U.S. prod by default', async () => {
      await new OAuth().getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints({
            environment: PlatformEnvironment.Prod,
            region: Region.US,
          }),
        })
      );
    });
  });
});
