jest.mock('@coveord/platform-client');
import PlatformClient from '@coveord/platform-client';
import {handler} from './token';
const mockedPlatformClient = jest.mocked(PlatformClient);
const mockedCreateToken = jest.fn();

describe('token', () => {
  const OLD_ENV = process.env;

  const setInvalidEnvironmentVariables = () => {
    process.env.ORGANIZATION_ID = undefined;
    process.env.API_KEY = undefined;
    process.env.USER_EMAIL = undefined;
  };

  const setValidEnvironmentVariables = () => {
    process.env.PLATFORM_URL = 'https://platform.cloud.coveo.com';
    process.env.ORGANIZATION_ID = 'my-org';
    process.env.API_KEY = 'xxx';
    process.env.USER_EMAIL = 'bob@coveo.com';
  };

  const doMockPlatformClient = () => {
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          search: {
            createToken: mockedCreateToken,
          },
        } as unknown as PlatformClient)
    );
  };

  const envVarError =
    'Make sure to configure the environment variables in the ".env" file. Refer to the README to set up the server.';
  const platformClientError = 'Error generating token.';

  beforeEach(() => {
    jest.resetModules();
    process.env = {...OLD_ENV};
    doMockPlatformClient();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('when env variables are not set, should return an error', async () => {
    const response = await handler();
    expect(JSON.parse(response.body).error).toBe(envVarError);
    expect(response.statusCode).toBe(401);
  });

  it('when env variables are invalid, should return an error', async () => {
    setInvalidEnvironmentVariables();
    const response = await handler();
    expect(JSON.parse(response.body).error).toBe(envVarError);
    expect(response.statusCode).toBe(401);
  });

  describe('when the env variables are valid', () => {
    beforeEach(() => setValidEnvironmentVariables());

    it('when the API key does not have the right privileges, should return an error', async () => {
      mockedCreateToken.mockRejectedValueOnce({});

      const response = await handler();
      expect(JSON.parse(response.body).error).toBe(platformClientError);
      expect(response.statusCode).toBe(500);
    });

    it('when the API key has the right privilege, should return the token', async () => {
      const token = 'this.is.a.search.token';
      mockedCreateToken.mockResolvedValueOnce({
        token,
      });

      const response = await handler();
      expect(JSON.parse(response.body).token).toBe(token);
      expect(response.statusCode).toBe(200);
    });
  });
});
