jest.mock('../../lib/oauth/oauth');
jest.mock('../../lib/oauth/storage');
jest.mock('../../lib/config/config');
import {test} from '@oclif/test';
import {mocked} from 'ts-jest/utils';
import {Config} from '../../lib/config/config';
import {OAuth} from '../../lib/oauth/oauth';
import {Storage} from '../../lib/oauth/storage';
const mockedOAuth = mocked(OAuth, true);
const mockedStorage = mocked(Storage, true);
const mockedConfig = mocked(Config, true);

describe('auth:login', () => {
  beforeEach(() => {
    mockedOAuth.mockImplementationOnce(
      () =>
        ({
          getToken: () =>
            Promise.resolve({
              accessToken: 'this-is-the-token',
              refreshToken: 'this-is-the-refresh-token',
            }),
        } as OAuth)
    );
  });

  test
    .command(['auth:login', '-e', 'foo'])
    .catch(/Expected --environment=foo/)
    .it('reject invalid environment');

  test
    .command(['auth:login', '-r', 'foo'])
    .catch(/Expected --region=foo/)
    .it('reject invalid region');

  ['dev', 'qa', 'prod', 'hipaa'].forEach((environment) => {
    test
      .stdout()
      .command(['auth:login', '-e', environment])
      .it(
        `passes the -e=${environment} flag to oauth and configuration`,
        () => {
          expect(mockedOAuth.mock.calls[0][0]?.environment).toBe(environment);
          expect(mockedConfig.mock.instances[0].set).toHaveBeenCalledWith(
            'environment',
            environment
          );
        }
      );
  });

  [
    'us-east-1',
    'eu-west-1',
    'eu-west-3',
    'ap-southeast-2',
    'us-west-2',
  ].forEach((region) => {
    test
      .stdout()
      .command(['auth:login', '-r', region])
      .it(`passes the -e=${region} flag to oauth and configuration`, () => {
        expect(mockedOAuth.mock.calls[0][0]?.region).toBe(region);
        expect(mockedConfig.mock.instances[0].set).toHaveBeenCalledWith(
          'region',
          region
        );
      });
  });

  test
    .stdout()
    .command(['auth:login', '-e', 'qa'])
    .it('passed the -e=dev flag to oauth as an environment', () => {
      expect(mockedOAuth.mock.calls[0][0]?.environment).toBe('qa');
    });

  describe('retrieves token from oauth service', () => {
    test
      .stdout()
      .command(['auth:login'])
      .it('save token from oauth service', () => {
        expect(mockedStorage.mock.instances[0].save).toHaveBeenCalledWith(
          'this-is-the-token',
          'this-is-the-refresh-token'
        );
      });
  });
});
