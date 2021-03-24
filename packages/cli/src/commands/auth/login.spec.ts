jest.mock('../../lib/oauth/oauth');
jest.mock('../../lib/config/config');
jest.mock('../../hooks/analytics/analytics');
jest.mock('../../hooks/prerun/prerun');
import {test} from '@oclif/test';
import {mocked} from 'ts-jest/utils';
import {Config} from '../../lib/config/config';
import {OAuth} from '../../lib/oauth/oauth';
const mockedOAuth = mocked(OAuth, true);
const mockedConfig = mocked(Config, true);

describe('auth:login', () => {
  beforeEach(() => {
    mockedOAuth.mockImplementationOnce(
      () =>
        ({
          getToken: () =>
            Promise.resolve({
              accessToken: 'this-is-the-token',
            }),
        } as OAuth)
    );
  });

  afterEach(() => {
    mockedConfig.mockReset();
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
      .command(['auth:login', '-e', environment, '-o', 'foo'])
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
      .command(['auth:login', '-r', region, '-o', 'foo'])
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
    .command(['auth:login', '-e', 'qa', '-o', 'foo'])
    .it('passed the -e=dev flag to oauth as an environment', () => {
      expect(mockedOAuth.mock.calls[0][0]?.environment).toBe('qa');
    });

  describe('retrieves token from oauth service', () => {
    test
      .stdout()
      .command(['auth:login', '-o', 'foo'])
      .it('save token from oauth service', () => {
        expect(mockedConfig.mock.instances[0].set).toHaveBeenCalledWith(
          'accessToken',
          'this-is-the-token'
        );
      });
  });
});
