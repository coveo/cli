jest.mock('@coveo/cli-commons/src/config/config');
jest.mock('@coveo/cli-commons/src/preconditions/trackable');

jest.mock('@coveo/cli-commons/src/platform/authenticatedClient');

import {Config} from '@coveo/cli-commons/src/config/config';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/src/platform/authenticatedClient';
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
});
