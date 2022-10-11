jest.mock('../../../lib/decorators/preconditions/git');
jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('../../../lib/snapshot/snapshotFactory');
jest.mock('../../../lib/project/project');
jest.mock('../../../lib/utils/process');

import {join} from 'path';
import {Config} from '@coveo/cli-commons/config/config';
import {
  ResourceSnapshotsReportType,
  ResourceSnapshotType,
  SnapshotAccessType,
} from '@coveo/platform-client';
import {test} from '@oclif/test';
import {getDummySnapshotModel} from '../../../__stub__/resourceSnapshotsModel';
import {getSuccessReport} from '../../../__stub__/resourceSnapshotsReportModel';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {Command, CliUx} from '@oclif/core';
import {PreconditionError} from '@coveo/cli-commons/errors/preconditionError';
import {cwd} from 'process';
import {Project} from '../../../lib/project/project';
import {IsGitInstalled} from '../../../lib/decorators/preconditions';
import {
  MissingResourcePrivileges,
  MissingSnapshotPrivilege,
} from '../../../lib/errors/snapshotErrors';

const mockedSnapshotFactory = jest.mocked(SnapshotFactory);
const mockedProject = jest.mocked(Project);
const mockedConfig = jest.mocked(Config);
const mockedConfigGet = jest.fn();
const mockedGetSnapshot = jest.fn();
const mockedDownloadSnapshot = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedIsGitInstalled = jest.mocked(IsGitInstalled);
const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockEvaluate = jest.fn();
const pathToStub = join(cwd(), 'src', '__stub__');

const doMockConfig = () => {
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

const doMockPreconditions = () => {
  const preconditionStatus = {
    git: true,
  };

  const thrower = () => {
    throw new PreconditionError('Precondition error');
  };
  const mockGit = function (_target: Command) {
    return new Promise<void>((resolve) =>
      preconditionStatus.git ? resolve() : thrower()
    );
  };
  mockedIsGitInstalled.mockReturnValue(mockGit);
};

const mockAuthenticatedClient = () => {
  const mockGetClient = jest.fn().mockResolvedValue({
    privilegeEvaluator: {
      evaluate: mockEvaluate,
    },
  });

  mockedAuthenticatedClient.prototype.getClient = mockGetClient;
};

const mockUserHavingAllRequiredPlatformPrivileges = () => {
  mockEvaluate.mockResolvedValue({approved: true});
};

const mockUserNotHavingAllRequiredPlatformPrivileges = () => {
  mockEvaluate.mockResolvedValue({approved: false});
};

const mockUserNotHavingAllRequiredResourcePrivileges = () => {
  mockedSnapshotFactory.createFromOrg.mockImplementation(() => {
    throw new MissingResourcePrivileges(
      [ResourceSnapshotType.source, ResourceSnapshotType.mlModel],
      SnapshotAccessType.Read
    );
  });
  mockedSnapshotFactory.createFromExistingSnapshot.mockImplementation(() => {
    throw new MissingSnapshotPrivilege(
      'some-snapshot-id',
      SnapshotAccessType.Read
    );
  });
};

const doMockSnapshotFactory = () => {
  mockedSnapshotFactory.createFromOrg.mockResolvedValue({
    delete: mockedDeleteSnapshot,
    download: mockedDownloadSnapshot,
  } as unknown as Snapshot);

  mockedSnapshotFactory.createFromExistingSnapshot.mockResolvedValue({
    delete: mockedDeleteSnapshot,
    download: mockedDownloadSnapshot,
  } as unknown as Snapshot);
};

describe('org:resources:pull', () => {
  beforeAll(() => {
    doMockConfig();
    mockAuthenticatedClient();

    mockedGetSnapshot.mockResolvedValue(
      getDummySnapshotModel('default-org', 'my-snapshot', [
        getSuccessReport('my-snapshot', ResourceSnapshotsReportType.Apply),
      ])
    );
  });

  beforeEach(() => {
    doMockSnapshotFactory();
    doMockPreconditions();
    mockUserHavingAllRequiredPlatformPrivileges();
  });

  afterEach(() => {
    mockEvaluate.mockClear();
    mockedProject.mockClear();
    mockedIsGitInstalled.mockClear();
    mockedSnapshotFactory.mockClear();
  });

  test
    .do(() => {
      mockUserNotHavingAllRequiredPlatformPrivileges();
    })
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .catch(/You are not authorized to create snapshot/)
    .it('should return an error message if platform privileges are missing');

  test
    .do(() => {
      mockUserNotHavingAllRequiredResourcePrivileges();
    })
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .catch((ctx) => {
      expect(ctx.message).toMatchSnapshot();
    })
    .it('should return an error message if resource privileges are missing');

  test
    .do(() => {
      mockUserNotHavingAllRequiredResourcePrivileges();
    })
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-s', 'some-snapshot-id'])
    .catch((ctx) => {
      expect(ctx.message).toMatchSnapshot();
    })
    .it(
      'should return an error message if resource privileges are missing for specific snapshot'
    );

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should use the cwd as project', () => {
      expect(mockedProject).toHaveBeenCalledWith(cwd(), expect.anything());
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-o', 'someorgid'])
    .it('should create Project with someOrgId', () => {
      expect(mockedProject).toHaveBeenCalledWith(
        expect.anything(),
        'someorgid'
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should download the snapshot', () => {
      expect(mockedDownloadSnapshot).toHaveBeenCalled();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should write the project resources manifest', () => {
      expect(mockedProject.prototype.writeResourcesManifest).toHaveBeenCalled();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should delete the snapshot', () => {
      expect(mockedDeleteSnapshot).toHaveBeenCalled();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-s', 'someSnapshotId'])
    .it('should not delete the snapshot', () => {
      expect(mockedDeleteSnapshot).not.toHaveBeenCalled();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should select all resource types', () => {
      const resourcesToExport = {
        FIELD: ['*'],
        FEATURED_RESULT: ['*'],
        SOURCE: ['*'],
        QUERY_PIPELINE: ['*'],
        SEARCH_PAGE: ['*'],
        EXTENSION: ['*'],
      };
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.objectContaining(resourcesToExport),
        'default-org',
        expect.objectContaining({})
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-r', 'FIELD', 'FEATURED_RESULT', 'SOURCE'])
    .it('should select specified resource types', () => {
      const resourcesToExport = {
        FIELD: ['*'],
        FEATURED_RESULT: ['*'],
        SOURCE: ['*'],
      };
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        resourcesToExport,
        'default-org',
        expect.objectContaining({})
      );
    });

  test
    .stdout()
    .stderr()
    .stub(CliUx.ux, 'confirm', () => () => Promise.resolve(true))
    .command([
      'org:resources:pull',
      '-m',
      join(pathToStub, 'snapshotPullModels', 'full.json'),
    ])
    .it(
      'should create a snapshot with all resource types specified in the model',
      () => {
        const resourcesToExport = {
          FIELD: ['*'],
          QUERY_PIPELINE: ['*'],
          ML_MODEL: ['*'],
          SUBSCRIPTION: ['*'],
        };
        expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
          resourcesToExport,
          expect.anything(),
          expect.objectContaining({})
        );
      }
    );

  test
    .stdout()
    .stderr()
    .stub(CliUx.ux, 'confirm', () => () => Promise.resolve(true))
    .command([
      'org:resources:pull',
      '-m',
      join(pathToStub, 'snapshotPullModels', 'subset.json'),
    ])
    .it(
      'should create a snapshot with only the specified resource items in the model',
      () => {
        const resourcesToExport = {
          FIELD: ['author', 'source', 'title'],
          QUERY_PIPELINE: ['default', 'agentPanel'],
          ML_MODEL: null,
          SEARCH_PAGE: null,
          SUBSCRIPTION: null,
        };
        expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
          resourcesToExport,
          expect.anything(),
          expect.objectContaining({})
        );
      }
    );

  test
    .stdout()
    .stderr()
    .stub(CliUx.ux, 'confirm', () => () => Promise.resolve(true))
    .command([
      'org:resources:pull',
      '-m',
      join(pathToStub, 'snapshotPullModels', 'full.json'),
    ])
    .it('should use the orgId from the model', () => {
      expect(mockedProject).toHaveBeenCalledWith(expect.anything(), 'myorgid');
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.anything(),
        'myorgid',
        expect.objectContaining({})
      );
    });

  test
    .stdout()
    .stderr()
    .command([
      'org:resources:pull',
      '-m',
      join(pathToStub, 'snapshotPullModels', 'missingOrgId.json'),
    ])
    .it('should use the orgId from the config', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.anything(),
        'default-org',
        expect.objectContaining({})
      );
    });

  test
    .stdout()
    .stderr()
    .command([
      'org:resources:pull',
      '-m',
      join(pathToStub, 'snapshotPullModels', 'missingResources.json'),
    ])
    .catch(/requires property "resourcesToExport"/)
    .it('should throw an invalid model error');

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should set a 60 seconds timeout', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.arrayContaining([]),
        'default-org',
        {wait: 60}
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-w', '78'])
    .it('should set a 78 seconds timeout', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.arrayContaining([]),
        'default-org',
        {wait: 78}
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-r', 'invalidresource'])
    .catch(/Expected --resourceTypes=invalidresource to be one of/)
    .it('should not allow invalid resource');
});
