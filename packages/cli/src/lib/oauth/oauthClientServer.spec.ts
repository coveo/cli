jest.mock('axios');
jest.mock('http');

import {Region} from '@coveord/platform-client';
import axios from 'axios';
import {
  createServer,
  IncomingMessage,
  RequestListener,
  Server,
  ServerResponse,
} from 'http';
import {MockedFunction} from 'ts-jest/dist/utils/testing';
import {mocked} from 'ts-jest/utils';
import {PlatformEnvironment, platformUrl} from '../platform/environment';
import {InvalidStateError} from './authorizationError';
import {OAuthClientServer} from './oauthClientServer';
import {AuthorizationServiceConfiguration, ClientConfig} from './oauthConfig';

const mockedAxios = mocked(axios, true);
// TODO: figure a cleaner way
const mockedCreateServer = mocked(createServer) as unknown as MockedFunction<{
  (requestListener?: RequestListener | undefined): Server;
}>;
// const mockedHttp = mocked(http);
const mockedServerListen = jest.fn();
const mockedServerClose = jest.fn();
const mockedAxiosPost = jest.fn();

mockedAxios.mockImplementation(mockedAxiosPost);

mockedCreateServer.mockImplementation(
  (listener?: RequestListener | undefined) => {
    const req = {
      url: '/?code=TheCode&state=TheState',
    } as unknown as IncomingMessage;
    const res = {end: jest.fn()} as unknown as ServerResponse;
    process.nextTick(() => listener && listener(req, res));
    return {
      listen: mockedServerListen,
      close: mockedServerClose,
    } as unknown as Server;
  }
);

describe('OAuthClientServer', () => {
  let oAuthClientServer: OAuthClientServer;
  let accessToken: string;
  const clientConfig: ClientConfig = {
    client_id: 'cli',
    redirect_uri: 'http://127.0.0.1:1234',
    scope: 'full',
  };
  const authServiceConfig = (opts?: {
    environment?: PlatformEnvironment;
    region?: Region;
  }): AuthorizationServiceConfiguration => ({
    authorizationEndpoint: `${platformUrl(opts)}/oauth/authorize`,
    revocationEndpoint: `${platformUrl(opts)}/logout`,
    tokenEndpoint: `${platformUrl(opts)}/oauth/token`,
  });

  beforeAll(() => {
    const opts = {environment: PlatformEnvironment.Prod};
    oAuthClientServer = new OAuthClientServer(
      clientConfig,
      authServiceConfig(opts)
    );
  });

  describe('when authenticating without error', () => {
    beforeEach(async () => {
      mockedAxiosPost.mockResolvedValue({
        data: {access_token: 'token-returned-by-the-platform'},
      });

      const serverResponse = await oAuthClientServer.startServer(
        8989,
        'http://127.0.0.1',
        'TheState'
      );
      accessToken = serverResponse.accessToken;
    });

    it('should listen on the right port and hostname', () => {
      expect(mockedServerListen).toHaveBeenCalledWith(8989, 'http://127.0.0.1');
    });

    it('should close the server', () => {
      expect(mockedServerClose).toHaveBeenCalledTimes(1);
    });

    it('should have returned an access token', () => {
      expect(accessToken).toEqual('token-returned-by-the-platform');
    });

    it('should make a POST call to the right endpoint', () => {
      expect(mockedAxiosPost).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: 'https://platform.cloud.coveo.com/oauth/token',
        })
      );
    });

    it('should make a POST call with the appropriate params', () => {
      const expectedParams = {
        grant_type: 'authorization_code',
        redirect_uri: 'http://127.0.0.1:1234',
        code: 'TheCode',
      };

      expect(mockedAxiosPost).toHaveBeenCalledWith(
        expect.objectContaining({
          data: new URLSearchParams(expectedParams),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        })
      );
    });
  });

  describe('when the state is unexpected', () => {
    let startServer: () => Promise<{
      accessToken: string;
    }>;
    beforeEach(async () => {
      mockedAxiosPost.mockResolvedValue({
        data: {access_token: 'token-returned-by-the-platform'},
      });

      startServer = () =>
        oAuthClientServer.startServer(8989, 'http://127.0.0.1', 'InvalidState');
    });

    it('should throw an error if the state is invalid', async () => {
      await expect(startServer()).rejects.toBeInstanceOf(InvalidStateError);
    });
  });
});
