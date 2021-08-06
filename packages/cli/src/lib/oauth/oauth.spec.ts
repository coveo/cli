import {
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
} from '@openid/appauth';
import {NodeBasedHandler} from '@openid/appauth/built/node_support';
import {
  PlatformEnvironment,
  PlatformRegion,
  platformUrl,
} from '../platform/environment';
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

  describe('should use proper @openid AuthorizationServiceConfiguration', () => {
    const endpoints = (opts?: {
      environment?: PlatformEnvironment;
      region?: PlatformRegion;
    }) => ({
      authorization_endpoint: `${platformUrl(opts)}/oauth/authorize`,
      revocation_endpoint: `${platformUrl(opts)}/logout`,
      token_endpoint: `${platformUrl(opts)}/oauth/token`,
    });
    it('in prod', async () => {
      const opts = {environment: 'prod' as const};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'baguettecli',
          redirect_uri: 'baguette://cli-auth',
          scope: 'full',
          ...endpoints(opts),
        })
      );
    });
    it('in qa', async () => {
      const opts = {environment: 'qa' as const};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints(opts),
        })
      );
    });
    it('in dev', async () => {
      const opts = {environment: 'dev' as const};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints(opts),
        })
      );
    });
    it('in hipaa', async () => {
      const opts = {environment: 'hipaa' as const};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints(opts),
        })
      );
    });
    it('in europe', async () => {
      const opts = {region: 'eu-west-1' as const};
      await new OAuth(opts).getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints(opts),
        })
      );
    });
    it('it should be us-east-1 prod by default', async () => {
      await new OAuth().getToken();
      expect(AuthorizationServiceConfiguration).toHaveBeenCalledWith(
        expect.objectContaining({
          ...endpoints({environment: 'prod', region: 'us-east-1'}),
        })
      );
    });
  });
});
