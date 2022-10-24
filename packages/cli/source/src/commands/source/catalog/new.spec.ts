jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');
jest.mock('@coveo/cli-commons/preconditions/apiKeyPrivilege');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {SourceType, SourceVisibility} from '@coveo/platform-client';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';

describe('source:catalog:new', () => {
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockSourceCreate = jest.fn();
  const mockedIsAuthenticated = jest.mocked(IsAuthenticated);
  const mockedHasNecessaryCoveoPrivileges = jest.mocked(
    HasNecessaryCoveoPrivileges
  );

  const doMockSourceCreate = () => {
    mockSourceCreate.mockReturnValue({id: 'the_id'});
  };

  const doMockAuthenticatedClient = () => {
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          getClient: () =>
            Promise.resolve({
              source: {create: mockSourceCreate},
            }),
        } as unknown as AuthenticatedClient)
    );
  };

  const doMockPreconditions = function () {
    const preconditionStatus = {
      authentication: true,
      privileges: true,
    };
    const mockedPreconditions = mockPreconditions(preconditionStatus);
    mockedIsAuthenticated.mockReturnValue(mockedPreconditions.authentication);
    mockedHasNecessaryCoveoPrivileges.mockReturnValue(
      mockedPreconditions.privileges
    );
  };

  beforeEach(() => {
    doMockPreconditions();
    doMockAuthenticatedClient();
    doMockSourceCreate();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test
    .stdout()
    .stderr()
    .command(['source:catalog:new', 'my source'])
    .it('uses source visibility SECURED by default', () => {
      expect(mockSourceCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'my source',
          sourceVisibility: SourceVisibility.SECURED,
        })
      );
    });

  test
    .stdout()
    .stderr()
    .command(['source:catalog:new', 'my source'])
    .it('uses source visibility SECURED by default', () => {
      expect(mockSourceCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'my source',
          sourceVisibility: SourceVisibility.SECURED,
          sourceType: SourceType.CATALOG,
          pushEnabled: true,
          streamEnabled: true,
        })
      );
    });

  test
    .stdout()
    .stderr()
    .command(['source:catalog:new', '-v', 'SHARED', 'my source'])
    .it('uses source visibility flag when specified', () => {
      expect(mockSourceCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'my source',
          sourceVisibility: SourceVisibility.SHARED,
        })
      );
    });
});
