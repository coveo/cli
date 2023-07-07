jest.mock('child_process');
jest.mock('fs-extra');
jest.mock('jsonschema');

jest.mock('@coveo/cli-commons/utils/ux');
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
import PlatformClient, {
  CoveoPlatformClientError,
  HostedPage,
  New,
} from '@coveo/platform-client';
import {Config, Configuration} from '@coveo/cli-commons/config/config';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions/index';
import {getPackageVersion} from '../../lib/utils/misc';
import {configurationMock} from '../../__stub__/configuration';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';
import {readJSONSync, readFileSync} from 'fs-extra';
import {DeployConfig} from './deploy';
import {validate, ValidatorResult} from 'jsonschema';
import {join} from 'path';
import {confirm} from '@coveo/cli-commons/utils/ux';

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
  schemaVersion: '1.0.0',
};

const pageTestId = 'thisistheid';
describe('ui:deploy', () => {
  const mockedConfig = jest.mocked(Config);
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedPlatformClient = jest.mocked(PlatformClient);
  const mockedGetPackageVersion = jest.mocked(getPackageVersion);
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedApiKeyPrivilege = jest.mocked(HasNecessaryCoveoPrivileges);
  const mockedIsAuthenticated = jest.mocked(IsAuthenticated);
  const mockedReadJSON = jest.mocked(readJSONSync);
  const mockedReadFileSync = jest.mocked(readFileSync);
  const mockedValidate = jest.mocked(validate);
  const mockHostedPageCreate = jest.fn();
  const mockHostedPageList = jest.fn();
  const mockHostedPageUpdate = jest.fn();
  const mockedConfirm = jest.mocked(confirm);

  const preconditionStatus = {
    apiKey: true,
    authentication: true,
  };

  const doMockPreconditions = function () {
    preconditionStatus.apiKey = true;
    preconditionStatus.authentication = true;
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

  const doMockedReadFileSync = () => {
    mockedReadFileSync.mockReturnValue('somefilecontents');
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
            create: mockHostedPageCreate.mockResolvedValue({id: 'somePageId'}),
            update: mockHostedPageUpdate.mockResolvedValue({}),
            list: mockHostedPageList.mockResolvedValue({
              items: [],
            }),
          },
        } as unknown as PlatformClient)
    );
  };

  let modifiedConfig: DeepPartial<DeployConfig>;

  beforeAll(() => {
    mockedConfirm.mockResolvedValue(true);
  });

  beforeEach(() => {
    doMockedGetPackageVersion();
    doMockSpawnProcess();
    doMockPlatformClient();
    doMockConfiguration();
    doMockAuthenticatedClient();
    doMockPreconditions();
    doMockValidate();
    doMockedValidReadJSON();
    doMockedReadFileSync();
    modifiedConfig = JSON.parse(JSON.stringify(validJsonConfig));
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
        delete modifiedConfig.schemaVersion;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
        doActualValidate();
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .catch(/instance requires property "schemaVersion"/)
      .it(
        'should exit with an error when the schemaVersion is not part of the JSON config'
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
        delete modifiedConfig.javascriptEntryFiles![0]!.path;
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

  describe('fetching file contents defined in the config', () => {
    test
      .do(() => {
        delete modifiedConfig.cssEntryFiles;
        delete modifiedConfig.javascriptEntryFiles;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .it('should fetch the htmlEntryFile content', () => {
        expect(mockedReadFileSync).toHaveBeenCalledWith(
          join(validJsonConfig.dir, validJsonConfig.htmlEntryFile.path),
          'utf-8'
        );
      });

    test
      .do(() => {
        delete modifiedConfig.javascriptEntryFiles;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .it('should fetch the cssEntryFiles content', () => {
        expect(mockedReadFileSync).toHaveBeenNthCalledWith(
          2,
          join(validJsonConfig.dir, validJsonConfig.cssEntryFiles![0].path),
          'utf-8'
        );
      });

    test
      .do(() => {
        delete modifiedConfig.cssEntryFiles;
        mockedReadJSON.mockImplementationOnce(() => modifiedConfig);
      })
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .it('should fetch the javascriptEntryFiles content', () => {
        expect(mockedReadFileSync).toHaveBeenNthCalledWith(
          2,
          join(
            validJsonConfig.dir,
            validJsonConfig.javascriptEntryFiles![0].path
          ),
          'utf-8'
        );
      });
  });

  describe('interacting with Platform client', () => {
    const expectedHostedPage: New<HostedPage> = {
      html: 'somefilecontents',
      name: validJsonConfig.name,
      javascript: [
        ...validJsonConfig.javascriptEntryFiles!.map(({isModule}) => ({
          inlineContent: 'somefilecontents',
          isModule,
        })),
        ...validJsonConfig.javascriptUrls!.map(({isModule, path}) => ({
          url: path,
          isModule,
        })),
      ],
      css: [
        ...validJsonConfig.cssEntryFiles!.map(() => ({
          inlineContent: 'somefilecontents',
        })),
        ...validJsonConfig.cssUrls!.map(({path}) => ({
          url: path,
        })),
      ],
    };

    test
      .stdout()
      .stderr()
      .command(['ui:deploy'])
      .it(
        'should call hostedPages.list and hostedPages.create when no page id argument is passed',
        ({stdout, stderr}) => {
          expect(mockHostedPageList).toHaveBeenCalledWith(
            expect.objectContaining({
              filter: expectedHostedPage.name,
            })
          );
          expect(stdout).toMatchSnapshot();
          expect(stderr).toMatchSnapshot();
          expect(mockHostedPageCreate).toHaveBeenCalledWith(expectedHostedPage);
        }
      );

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValueOnce(true);
        mockHostedPageList.mockResolvedValueOnce({
          items: [{name: validJsonConfig.name, id: pageTestId}],
        });
      })
      .command(['ui:deploy'])
      .it(
        'when no page id argument is passed and a page with the same name already exists, it should ask the user for confirmation',
        () => {
          expect(mockedConfirm).toBeCalled();
        }
      );

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValueOnce(true);
        mockHostedPageList.mockResolvedValueOnce({
          items: [{name: validJsonConfig.name, id: pageTestId}],
        });
      })
      .command(['ui:deploy'])
      .it(
        'when no page id argument is passed, a page with the same name already exists, and the user confirms the overwrite, it should call hostedPages.update',
        () => {
          expect(mockHostedPageUpdate).toHaveBeenCalledWith({
            ...expectedHostedPage,
            id: pageTestId,
          });
        }
      );

    test
      .stdout()
      .stderr()
      .do(() => {
        mockedConfirm.mockResolvedValueOnce(false);
        mockHostedPageList.mockResolvedValueOnce({
          items: [{name: validJsonConfig.name, id: pageTestId}],
        });
      })
      .command(['ui:deploy'])
      .catch((err) => expect(err).toMatchSnapshot())
      .it(
        'when no page id argument is passed, a page with the same name already exists, the user declines the overwrite, it should not call hostedPages.update',
        () => {
          expect(mockHostedPageUpdate).not.toBeCalled();
        }
      );

    test
      .stdout()
      .stderr()
      .command(['ui:deploy', `-p=${pageTestId}`])
      .it(
        'when a page id argument is passed, it should call hostedPages.update',
        ({stdout, stderr}) => {
          expect(stdout).toMatchSnapshot();
          expect(stderr).toMatchSnapshot();
          expect(mockHostedPageUpdate).toHaveBeenCalledWith({
            ...expectedHostedPage,
            id: pageTestId,
          });
        }
      );

    test
      .stdout()
      .stderr()
      .do(() => {
        mockHostedPageUpdate.mockImplementationOnce(() => {
          const err = new CoveoPlatformClientError();
          err.title = 'SO_BAD';
          err.detail = 'this is bad';
          err.xRequestId = 'b33pb00p';
          err.status = 418;
          throw err;
        });
      })
      .command(['ui:deploy', `-p=${pageTestId}`])
      .catch((err) => expect(err).toMatchSnapshot())
      .it('should print an API Error if the update fails');
  });
});
