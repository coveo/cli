jest.mock('../../lib/oauth/oauth');
jest.mock('../../lib/config/config');
jest.mock('../../hooks/analytics/analytics');
jest.mock('../../hooks/prerun/prerun');
jest.mock('../../lib/platform/authenticatedClient');
jest.mock('@coveord/platform-client');
import {Region} from '@coveord/platform-client';
import {test} from '@oclif/test';
import {mocked} from 'jest-mock';
import {Config} from '../../lib/config/config';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {PlatformEnvironment} from '../../lib/platform/environment';
const mockedConfig = mocked(Config, true);
const mockedAuthenticatedClient = mocked(AuthenticatedClient);

describe('auth:token', () => {
  const mockConfigSet = jest.fn();

  const mockConfigGet = jest.fn().mockReturnValue(
    Promise.resolve({
      region: 'us',
      organization: 'foo',
      environment: 'prod',
    })
  );

  const mockListOrgs = jest
    .fn()
    .mockReturnValue(Promise.resolve([{id: 'foo'}]));

  const mockGetHasAccessToOrg = jest
    .fn()
    .mockReturnValue(Promise.resolve(true));

  beforeEach(() => {
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          getAllOrgsUserHasAccessTo: mockListOrgs,
          getUserHasAccessToOrg: mockGetHasAccessToOrg,
        } as unknown as AuthenticatedClient)
    );

    mockedConfig.mockImplementation(
      () =>
        ({
          get: mockConfigGet,
          set: mockConfigSet,
        } as unknown as Config)
    );
  });

  afterEach(() => {
    mockConfigSet.mockClear();
  });

  test
    .stdout()
    .stderr()
    .command(['auth:token', '-e', 'foo'])
    .catch(/Expected --environment=foo/)
    .it('reject invalid environment', async () => {});

  test
    .stdout()
    .stderr()
    .command(['auth:token', '-r', 'foo'])
    .catch(/Expected --region=foo/)
    .it('reject invalid region', async () => {});

  Object.values(PlatformEnvironment).forEach((environment) => {
    test
      .stdout()
      .stderr()
      .command(['auth:token', '-e', environment, '-t', 'someToken'])
      .it(`writes the -e=${environment} flag to the configuration`, () => {
        expect(mockConfigSet).toHaveBeenCalledWith('environment', environment);
      });
  });

  Object.keys(Region).forEach((region) => {
    test
      .stdout()
      .stderr()
      .command(['auth:token', '-r', region, '-t', 'someToken'])
      .it(`writes the -r=${region} flag  and configuration`, () => {
        expect(mockConfigSet).toHaveBeenCalledWith('region', region);
      });
  });

  describe('writes the token and set anonymous to true in the configuration ', () => {
    test
      .stdout()
      .stderr()
      .command(['auth:token', '-t', 'this-is-the-token'])
      .it('save token from oauth service', () => {
        expect(mockConfigSet).toHaveBeenCalledWith(
          'accessToken',
          'this-is-the-token'
        );
        expect(mockConfigSet).toHaveBeenCalledWith('anonymous', true);
      });
  });

  test
    .stdout()
    .stderr()
    .command(['auth:token'])
    .exit(2)
    .it('fails when the token flag is not set');

  test
    .stdout()
    .stderr()
    .do(() => {
      mockGetHasAccessToOrg.mockReturnValueOnce(Promise.resolve(true));
    })
    .command(['auth:token', '-t', 'some-token'])
    .it(
      'succeed when the organization and the token flags are valid',
      (ctx) => {
        expect(ctx.stdout).toContain('Success');
      }
    );

  test
    .do(() => {
      mockListOrgs.mockReturnValueOnce(
        Promise.resolve([{id: 'the_first_org_available'}])
      );
    })
    .stdout()
    .stderr()
    .command(['auth:token', '-t', 'some-token'])
    .it(
      'find the org associated with the token and saves it in the config',
      () => {
        expect(mockConfigSet).toHaveBeenCalledWith(
          'organization',
          'the_first_org_available'
        );
      }
    );
});
