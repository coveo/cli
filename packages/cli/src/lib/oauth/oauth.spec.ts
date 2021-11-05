import {Region} from '@coveord/platform-client';
import {mocked} from 'ts-jest/utils';
import {fancyIt} from '../../__test__/it';
import {PlatformEnvironment, platformUrl} from '../platform/environment';
import {OAuth} from './oauth';
import {OAuthClientServer} from './oauthClientServer';

jest.mock('./oauthClientServer');
jest.mock('open');

const mockedOauthClientServer = mocked(OAuthClientServer, true);
const mockedStartServer = jest.fn();

mockedOauthClientServer.prototype.startServer.mockImplementation(
  mockedStartServer
);

describe('OAuth', () => {
  fancyIt()('should return the access token when requested', async () => {
    mockedStartServer.mockResolvedValueOnce({
      accessToken: 'this-is-the-new-access-token',
    });
    const {accessToken} = await new OAuth().getToken();
    expect(accessToken).toEqual('this-is-the-new-access-token');
  });

  describe('should use proper port for client server', () => {
    fancyIt()('using default port', async () => {
      await new OAuth().getToken();
      expect(mockedStartServer).toHaveBeenCalledWith(
        32111,
        expect.anything(),
        expect.anything()
      );
    });

    fancyIt()('using configured port', async () => {
      await new OAuth({port: 444}).getToken();
      expect(mockedStartServer).toHaveBeenCalledWith(
        444,
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('should use proper ClientConfig', () => {
    const endpoints = (opts?: {
      environment?: PlatformEnvironment;
      region?: Region;
    }) => ({
      authorizationEndpoint: `${platformUrl(opts)}/oauth/authorize`,
      revocationEndpoint: `${platformUrl(opts)}/logout`,
      tokenEndpoint: `${platformUrl(opts)}/oauth/token`,
    });

    const defaultClientConfig = {
      client_id: 'cli',
      redirect_uri: 'http://127.0.0.1:32111',
      scope: 'full',
    };

    fancyIt()('in prod', async () => {
      const opts = {environment: PlatformEnvironment.Prod};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    fancyIt()('in qa', async () => {
      const opts = {environment: PlatformEnvironment.QA};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    fancyIt()('in dev', async () => {
      const opts = {environment: PlatformEnvironment.Dev};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    fancyIt()('in hipaa', async () => {
      const opts = {environment: PlatformEnvironment.QA};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    fancyIt()('in Europe', async () => {
      const opts = {region: Region.EU};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    fancyIt()('it should be U.S. prod by default', async () => {
      await new OAuth().getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints({
          environment: PlatformEnvironment.Prod,
          region: Region.US,
        })
      );
    });
  });
});
