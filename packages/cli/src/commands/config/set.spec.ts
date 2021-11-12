jest.mock('../../lib/config/config');
jest.mock('../../hooks/analytics/analytics');
jest.mock('../../hooks/prerun/prerun');
jest.mock('../../lib/platform/authenticatedClient');

import {mocked} from 'ts-jest/utils';
import {Config} from '../../lib/config/config';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {Region} from '@coveord/platform-client';
import {PlatformEnvironment} from '../../lib/platform/environment';
const mockedConfig = mocked(Config);
const mockedClient = mocked(AuthenticatedClient);

describe('config:set', () => {
  const mockSet = jest.fn();
  const mockGet = jest.fn().mockReturnValue({});
  const mockGetHasAccessToOrg = jest.fn();

  mockedConfig.mockImplementation(
    () =>
      ({
        set: mockSet,
        get: mockGet,
      } as unknown as Config)
  );

  mockedClient.mockImplementation(
    () =>
      ({
        getUserHasAccessToOrg: mockGetHasAccessToOrg,
      } as unknown as AuthenticatedClient)
  );

  test
    .stdout()
    .stderr()
    .command(['config:set'])
    .it(
      'allows to call set without any flags and should not modify configuration',
      () => {
        expect(mockSet).not.toHaveBeenCalled();
      }
    );

  Object.values(PlatformEnvironment).forEach((environment) => {
    test
      .stdout()
      .stderr()
      .command(['config:set', '-e', environment])
      .it(`allows to modify environment ${environment}`, () => {
        expect(mockSet).toHaveBeenCalledWith('environment', environment);
      });
  });

  test
    .stdout()
    .stderr()
    .command(['config:set', '-e', 'foo'])
    .catch(/Expected --environment=foo/)
    .it('fails when trying to set an invalid environment', () => {
      expect(mockSet).not.toHaveBeenCalled();
    });

  Object.keys(Region).forEach((region) => {
    test
      .stdout()
      .stderr()
      .command(['config:set', '-r', region])
      .it(`allows to modify region ${region}`, () => {
        expect(mockSet).toHaveBeenCalledWith('region', region);
      });
  });

  test
    .stdout()
    .stderr()
    .command(['config:set', '-r', 'foo'])
    .catch(/Expected --region=foo/)
    .it('fails when trying to set an invalid region', () => {
      expect(mockSet).not.toHaveBeenCalled();
    });

  test
    .stdout()
    .stderr()
    .do(() => {
      mockGetHasAccessToOrg.mockReturnValueOnce(Promise.resolve(true));
    })
    .command(['config:set', '-o', 'the_org'])
    .it(
      'allows to modify the organization of the user has access to it',
      () => {
        expect(mockSet).toHaveBeenCalledWith('organization', 'the_org');
      }
    );

  test
    .stdout()
    .stderr()
    .do(() => {
      mockGetHasAccessToOrg.mockReturnValueOnce(Promise.resolve(false));
    })
    .command(['config:set', '-o', 'the_org'])
    .catch(/don't have access to organization the_org/)
    .it(
      'fails when trying to set to an invalid organization the user does not have access to',
      () => {
        expect(mockSet).not.toHaveBeenCalled();
      }
    );

  test
    .stdout()
    .stderr()
    .command(['config:set', '-a', 'y'])
    .it('allows to modify the analytics configuration', () => {
      expect(mockSet).toHaveBeenCalledWith('analyticsEnabled', true);
    });

  test
    .stdout()
    .stderr()
    .command(['config:set', '-a', 'y'])
    .it('should display the config', () => {
      expect(mockSet).toHaveBeenCalledTimes(1);
    });
});
