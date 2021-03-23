jest.mock('../../lib/oauth/oauth');
jest.mock('../../lib/oauth/storage');
jest.mock('../../lib/config/config');
jest.mock('keytar');
jest.mock('../../hooks/analytics/analytics');
jest.mock('../../hooks/prerun/prerun');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');
import {test} from '@oclif/test';
import {mocked} from 'ts-jest/utils';
import {Config} from '../../lib/config/config';
import {OAuth} from '../../lib/oauth/oauth';
import {Storage} from '../../lib/oauth/storage';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {PlatformClient} from '@coveord/platform-client';
const mockedOAuth = mocked(OAuth, true);
const mockedStorage = mocked(Storage, true);
const mockedConfig = mocked(Config, true);
const mockedAuthenticatedClient = mocked(AuthenticatedClient);
const mockedPlatformClient = mocked(PlatformClient);

describe('auth:login', () => {
  const mockConfigSet = jest.fn();
  const mockListOrgs = jest.fn();

  beforeEach(() => {
    mockListOrgs.mockReturnValue(Promise.resolve([{id: 'foo'}]));
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          organization: {list: mockListOrgs} as unknown,
        } as PlatformClient)
    );
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          getClient: () =>
            Promise.resolve(
              mockedPlatformClient.getMockImplementation()!({
                accessToken: 'theToken',
                organizationId: 'foo',
              })
            ),
        } as AuthenticatedClient)
    );
    mockedOAuth.mockImplementationOnce(
      () =>
        ({
          getToken: () =>
            Promise.resolve({
              accessToken: 'this-is-the-token',
            }),
        } as OAuth)
    );

    mockedConfig.mockImplementation(
      () =>
        (({
          get: () =>
            Promise.resolve({
              region: 'us-east-1',
              organization: 'foo',
              environment: 'prod',
            }),
          set: mockConfigSet,
        } as unknown) as Config)
    );
  });

  afterEach(() => {
    mockConfigSet.mockClear();
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
          expect(mockConfigSet).toHaveBeenCalledWith(
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
        expect(mockConfigSet).toHaveBeenCalledWith('region', region);
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
        expect(mockedStorage.mock.instances[0].save).toHaveBeenCalledWith(
          'this-is-the-token'
        );
      });
  });

  test
    .stdout()
    .command(['auth:login', '-o', 'this_is_not_a_valid_org'])
    .exit(2)
    .it('fails when organization flag is invalid');

  test
    .do(() => {
      mockListOrgs.mockReturnValueOnce(Promise.resolve([]));
    })
    .stdout()
    .command(['auth:login'])
    .exit(2)
    .it(
      'fails when no organization flag is passed and the user has access to no organization'
    );

  test
    .stdout()
    .command(['auth:login', '-o', 'foo'])
    .it('succeed when organization flag is valid', (ctx) => {
      expect(ctx.stdout).toContain('Success');
    });
});
