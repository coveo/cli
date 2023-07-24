import type {ChildProcess} from 'child_process';

import {Region} from '@coveo/platform-client';
import {
  PlatformEnvironment,
  platformUrl,
} from '@coveo/cli-commons/platform/environment';
import {OAuth} from './oauth';
import {OAuthClientServer} from './oauthClientServer';
import open from 'open';
import getPort from 'get-port';

jest.mock('./oauthClientServer');
jest.mock('open');
jest.mock('get-port');

describe('OAuth', () => {
  const mockedOauthClientServer = jest.mocked(OAuthClientServer);
  const mockedOpen = jest.mocked(open);
  const mockedGetPort = jest.mocked(getPort);
  const mockedStartServer = jest.fn();

  beforeAll(() => {
    mockedOauthClientServer.prototype.startServer.mockImplementation(
      mockedStartServer
    );
    mockedOpen.mockResolvedValue({unref: () => {}} as ChildProcess);
    mockedGetPort.mockResolvedValue(52296);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return the access token when requested', async () => {
    mockedStartServer.mockResolvedValueOnce({
      accessToken: 'this-is-the-new-access-token',
    });
    const {accessToken} = await new OAuth().getToken();
    expect(accessToken).toEqual('this-is-the-new-access-token');
  });

  it('should call `get-port` to acquire a port', async () => {
    await new OAuth().getToken();
    expect(mockedGetPort).toHaveBeenCalledWith({port: [52296, 32111]});
  });

  it('should use proper port for client server', async () => {
    await new OAuth().getToken();
    expect(mockedStartServer).toHaveBeenCalledWith(
      52296,
      expect.anything(),
      expect.anything()
    );
  });

  it('should throw an OAuthBusyError if both OAuth ports are busy', async () => {
    mockedGetPort.mockResolvedValueOnce(42);
    expect(() => new OAuth().getToken()).rejects.toThrowErrorMatchingSnapshot();
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
      redirect_uri: 'http://127.0.0.1:52296',
      scope: 'full',
    };

    it('in prod', async () => {
      const opts = {environment: PlatformEnvironment.Prod};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    it('in stg', async () => {
      const opts = {environment: PlatformEnvironment.Stg};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    it('in dev', async () => {
      const opts = {environment: PlatformEnvironment.Dev};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    it('in hipaa', async () => {
      const opts = {environment: PlatformEnvironment.Stg};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    it('in Europe', async () => {
      const opts = {region: Region.EU};
      await new OAuth(opts).getToken();
      expect(mockedOauthClientServer).toHaveBeenCalledWith(
        defaultClientConfig,
        endpoints(opts)
      );
    });

    it('it should be U.S. prod by default', async () => {
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
