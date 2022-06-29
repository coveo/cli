jest.mock('../../lib/config/config');
jest.mock('../../hooks/analytics/analytics');
jest.mock('../../hooks/prerun/prerun');
jest.mock('../../lib/platform/authenticatedClient');

import {Config} from '../../lib/config/config';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
const mockedConfig = jest.mocked(Config);
const mockedClient = jest.mocked(AuthenticatedClient);

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
    .catch(/Command should contain at least 1 flag/)
    .it('should not allows to call set without any flags');

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
