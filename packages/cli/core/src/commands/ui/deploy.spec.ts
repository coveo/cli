jest.mock('child_process');
jest.mock('fs-extra');
jest.mock('jsonschema');

jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');
jest.mock('@coveo/cli-commons/preconditions/apiKeyPrivilege');
jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveo/platform-client');

jest.mock('../../lib/utils/process');
jest.mock('../../lib/oauth/oauth');
jest.mock('../../lib/utils/misc');

import {test} from '@oclif/test';
import {spawnProcess} from '../../lib/utils/process';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import PlatformClient from '@coveo/platform-client';
import {Config, Configuration} from '@coveo/cli-commons/config/config';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions/index';
import {getPackageVersion} from '../../lib/utils/misc';
import {configurationMock} from '../../__stub__/configuration';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';
import {readJSONSync} from 'fs-extra';
import {DeployConfig} from './deploy';
import {validate, ValidatorResult} from 'jsonschema';
const actualValidate = jest.requireActual('jsonschema').validate;

type DeepPartial<T> = T extends Function
  ? T
  : T extends object
  ? {[P in keyof T]?: DeepPartial<T[P]>}
  : T;

const validJsonConfig: DeployConfig = {
  name: 'my page',
  dir: 'dist',
  htmlEntryFile: {
    path: 'index.html',
  },
  javascriptEntryFiles: [
    {
      path: 'index.js',
      isModule: false,
    },
  ],
  javascriptUrls: [
    {
      path: 'https://static.cloud.coveo.com/atomic/v2/atomic.esm.js',
      isModule: true,
    },
  ],
  cssEntryFiles: [
    {
      path: 'css/index.css',
    },
  ],
  cssUrls: [
    {
      path: 'https://static.cloud.coveo.com/atomic/v2/themes/coveo.css',
    },
  ],
};

describe('ui:deploy', () => {
  const mockedConfig = jest.mocked(Config);
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedApiKeyPrivilege = jest.mocked(HasNecessaryCoveoPrivileges);
  const mockedIsAuthenticated = jest.mocked(IsAuthenticated);
  const mockedReadJSON = jest.mocked(readJSONSync);
  const mockedValidate = jest.mocked(validate);

  const preconditionStatus = {
    apiKey: true,
    authentication: true,
  };

  const doMockPreconditions = function () {
    const mockedPreconditions = mockPreconditions(preconditionStatus);
    mockedApiKeyPrivilege.mockReturnValue(mockedPreconditions.apiKey);
    mockedIsAuthenticated.mockReturnValue(mockedPreconditions.authentication);
  };

  const doMockSpawnProcess = () => {
    mockedSpawnProcess.mockReturnValue(Promise.resolve(0));
  };

  const doMockedGetPackageVersion = () => {
    mockedGetPackageVersion.mockReturnValue('1.0.0');
  };

  const doMockedValidReadJSON = () => {
    mockedReadJSON.mockReturnValue(validJsonConfig);
  };

  const doMockValidate = (valid = true) =>
    mockedValidate.mockReturnValue({valid} as ValidatorResult);

  const doActualValidate = () =>
    mockedValidate.mockImplementationOnce((...args) => actualValidate(...args));

  const doMockConfiguration = () => {
    mockedConfig.mockImplementation(
      configurationMock({
        accessToken: 'foo',
        environment: 'dev',
        region: 'us',
        organization: 'my-org',
      } as Configuration)
    );
  };

  const doMockAuthenticatedClient = () => {
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          createImpersonateApiKey: jest.fn(),
          getUsername: () => Promise.resolve('bob@coveo.com'),
          getClient: () =>
            Promise.resolve(
              mockedPlatformClient.getMockImplementation()!({
                accessToken: 'foo',
                organizationId: 'my-org',
              })
            ),
          cfg: mockedConfig.getMockImplementation()!('./'),
        } as unknown as AuthenticatedClient)
    );
  };

  const doMockPlatformClient = () => {
    mockedPlatformClient.mockImplementation(
      () =>
        ({
          initialize: () => Promise.resolve(),
          hostedPages: {
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
        } as unknown as PlatformClient)
    );
  };

  beforeEach(() => {
    doMockedGetPackageVersion();
    doMockSpawnProcess();
    doMockPlatformClient();
    doMockConfiguration();
    doMockAuthenticatedClient();
    doMockPreconditions();
    doMockValidate();
    doMockedValidReadJSON();
    preconditionStatus.apiKey = true;
    preconditionStatus.authentication = true;
  });

  afterEach(() => {
    mockedApiKeyPrivilege.mockClear();
  });

  describe('when preconditions are not respected', () => {
    test
      .do(() => {
        preconditionStatus.apiKey = false;
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/apiKey Precondition Error/)
      .it(
        'should not execute the command if the API key preconditions are not respected'
      );

    test
      .do(() => {
        preconditionStatus.authentication = false;
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/authentication Precondition Error/)
      .it(
        'should not execute the command if the preconditions are not respected'
      );
  });

  describe('validating JSON config file', () => {
    let modifiedConfig: DeepPartial<DeployConfig>;
    beforeEach(() => {
      modifiedConfig = {...validJsonConfig};
    });

    test
      .do(() => {
        mockedReadJSON.mockImplementationOnce(() => null);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/Parsing: coveo.deploy.json./)
      .it(
        'should exit with an error when the default config file does not exist'
      );

    test
      .do(() => {
        mockedReadJSON.mockImplementationOnce(() => null);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy', '-c=myconfig.json'])
      .catch(/Parsing: myconfig.json./)
      .it(
        'should exit with an error when the defined config file does not exist'
      );

    test
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .it(
        'should read the default config file without throwing when it exists & is valid',
        () => {
          expect(mockedReadJSON).toHaveBeenCalledWith(
            'coveo.deploy.json',
            expect.any(Object)
          );
        }
      );

    test
      .do(() => {
        delete modifiedConfig.htmlEntryFile;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/instance requires property "htmlEntryFile"/)
      .it(
        'should exit with an error when the htmlEntryFile is not part of the JSON config'
      );

    test
      .do(() => {
        delete modifiedConfig.dir;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/instance requires property "dir"/)
      .it(
        'should exit with an error when the dir is not part of the JSON config'
      );

    test
      .do(() => {
        delete modifiedConfig.cssEntryFiles![0]!.path;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/requires property "path"/)
      .it(
        'should exit with an error when the cssEntryFiles path is not part of the JSON config'
      );

    test
      .do(() => {
        delete modifiedConfig.cssUrls![0]!.path;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/requires property "path"/)
      .it(
        'should exit with an error when the cssUrls path is not part of the JSON config'
      );

    test
      .do(() => {
        delete modifiedConfig.javascriptEntryFiles![0]!.isModule;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/requires property "isModule"/)
      .it(
        'should exit with an error when the javascriptEntryFiles isModule is not part of the JSON config'
      );

    test
      .do(() => {
        delete (modifiedConfig.javascriptEntryFiles![0] as any).path;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/requires property "path"/)
      .it(
        'should exit with an error when the javascriptEntryFiles path is not part of the JSON config'
      );

    test
      .do(() => {
        delete modifiedConfig.javascriptUrls![0]!.isModule;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/requires property "isModule"/)
      .it(
        'should exit with an error when the javascriptUrls isModule is not part of the JSON config'
      );

    test
      .do(() => {
        delete modifiedConfig.javascriptUrls![0]!.path;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/requires property "path"/)
      .it(
        'should exit with an error when the javascriptUrls path is not part of the JSON config'
      );
  });

  describe.skip('fetching file contents defined in the config', () => {});

  describe.skip('interacting with Platform client', () => {});

  // should call update if id passed
  // should call create if no id
});
