jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {SourceType, SourceVisibility} from '@coveord/platform-client';
import {Config} from '../../../lib/config/config';

const mockedConfig = jest.mocked(Config);
const mockedConfigGet = jest.fn();
const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockEvaluate = jest.fn();
const spyCreate = jest.fn().mockReturnValue({id: 'the_id'});

const mockUserHavingAllRequiredPlatformPrivileges = () => {
  mockEvaluate.mockResolvedValue({approved: true});
};

const mockUserNotHavingAllRequiredPlatformPrivileges = () => {
  mockEvaluate.mockResolvedValue({approved: false});
};

const doMockAuthenticatedClient = () => {
  mockedAuthenticatedClient.mockImplementation(
    () =>
      ({
        getClient: () =>
          Promise.resolve({
            source: {create: spyCreate},
            privilegeEvaluator: {
              evaluate: mockEvaluate,
            },
          }),
      } as unknown as AuthenticatedClient)
  );
};

const doMockConfig = () => {
  mockedConfigGet.mockReturnValue(
    Promise.resolve({
      region: 'us',
      organization: 'default-org',
      environment: 'prod',
    })
  );

  mockedConfig.prototype.get = mockedConfigGet;
};

describe('source:catalog:new', () => {
  beforeAll(() => {
    doMockConfig();
    doMockAuthenticatedClient();
  });

  describe('when required privileges are respected', () => {
    beforeAll(() => {
      mockUserHavingAllRequiredPlatformPrivileges();
    });

    afterAll(() => {
      mockEvaluate.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command(['source:catalog:new', 'my source'])
      .it('uses source visibility SECURED by default', () => {
        expect(spyCreate).toHaveBeenCalledWith(
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
        expect(spyCreate).toHaveBeenCalledWith(
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
        expect(spyCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'my source',
            sourceVisibility: SourceVisibility.SHARED,
          })
        );
      });
  });

  describe('when required privileges are missing', () => {
    beforeAll(() => {
      mockUserNotHavingAllRequiredPlatformPrivileges();
    });

    afterAll(() => {
      mockEvaluate.mockReset();
    });

    test
      .stdout()
      .stderr()
      .command(['source:catalog:new', 'my-source'])
      .catch(/You are not authorized to edit sources/)
      .it('should return a precondition error');
  });
});
