jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/config/globalConfig');
jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/platform/authenticatedClient');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {SourceVisibility} from '@coveord/platform-client';
import {Config} from '@coveo/cli-commons/config/config';
import globalConfig from '@coveo/cli-commons/config/globalConfig';
import type {Interfaces} from '@oclif/core';

const mockedGlobalConfig = jest.mocked(globalConfig);
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
  mockedGlobalConfig.get.mockReturnValue({
    configDir: 'the_config_dir',
    version: '1.2.3',
    platform: 'darwin',
  } as Interfaces.Config);
  mockedConfigGet.mockReturnValue({
    region: 'us',
    organization: 'default-org',
    environment: 'prod',
  });

  mockedConfig.mockImplementation(
    () =>
      ({
        get: mockedConfigGet,
      } as unknown as Config)
  );
};

describe('source:push:new', () => {
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
      .command(['source:push:new', 'my source'])
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
      .command(['source:push:new', 'my source'])
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
      .command(['source:push:new', '-v', 'SHARED', 'my source'])
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
      .command(['source:push:new', 'my-source'])
      .catch(/You are not authorized to edit sources/)
      .it('should return a precondition error');
  });
});
