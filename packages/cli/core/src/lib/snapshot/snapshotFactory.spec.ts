jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('fs');
jest.mock('./snapshot');

import {ResourceSnapshotType} from '@coveord/platform-client';
import {readFileSync} from 'fs';
import {join} from 'path';
import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {SnapshotPullModelResources} from './pullModel/interfaces';
import {Snapshot} from './snapshot';
import {SnapshotFactory} from './snapshotFactory';
import {Project} from '../project/project';

// TODO: mock project.resourceTypes
const mockedReadFileSync = jest.mocked(readFileSync);
const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockedSnapshot = jest.mocked(Snapshot);
const mockedCreateSnapshotFromBuffer = jest.fn();
const mockedCreateFromOrganization = jest.fn();
const mockedPushSnapshot = jest.fn();
const mockedDryRunSnapshot = jest.fn();
const mockedGetClient = jest.fn();
const mockedGetSnapshot = jest.fn();

const doMockSnapshot = () => {
  mockedSnapshot.prototype.waitUntilDone.mockImplementation(() =>
    Promise.resolve()
  );
};

const doMockReadFile = () => {
  mockedReadFileSync.mockReturnValue(Buffer.from('hello there'));
};

const doMockAuthenticatedClient = () => {
  mockedGetClient.mockImplementation(() =>
    Promise.resolve({
      resourceSnapshot: {
        get: mockedGetSnapshot,
        createFromBuffer: mockedCreateSnapshotFromBuffer,
        createFromOrganization: mockedCreateFromOrganization,
        push: mockedPushSnapshot,
        dryRun: mockedDryRunSnapshot,
      },
    })
  );

  mockedAuthenticatedClient.prototype.getClient.mockImplementation(
    mockedGetClient
  );
};

// TODO: unskip
describe.skip('SnapshotFactory', () => {
  beforeAll(() => {
    doMockAuthenticatedClient();
    doMockReadFile();
    doMockSnapshot();
  });

  describe('when the snapshot is created from a ZIP', () => {
    const projectPath = join('dummy', 'path');
    const dummyProject = new Project(projectPath);

    beforeEach(async () => {
      await SnapshotFactory.createSnapshotFromProject(
        dummyProject,
        'my-target-org'
      );
    });

    fancyIt()(
      'should create a client connected to the right organization',
      () => {
        expect(mockedGetClient).toHaveBeenCalledWith({
          organization: 'my-target-org',
        });
      }
    );

    fancyIt()(
      '#createSnapshotFromProject should retrieve an authenticated client',
      () => {
        expect(mockedCreateSnapshotFromBuffer).toHaveBeenCalledTimes(1);
      }
    );

    fancyIt()(
      '#createSnapshotFromProject should create a snapshot from Zip with appropriate parameters',
      () => {
        expect(mockedCreateSnapshotFromBuffer).toHaveBeenCalledWith(
          Buffer.from('hello there'),
          'ZIP',
          {
            developerNotes: 'cli-created-from-zip',
          }
        );
      }
    );

    fancyIt()(
      '#createSnapshotFromProject should create a readstream with the appropriate path to zip',
      () => {
        expect(mockedReadFileSync).toHaveBeenCalledWith(join('dummy', 'path'));
      }
    );
  });

  describe('when the snapshot is created from an exisiting one', () => {
    const targetId = 'target-id';
    const snapshotId = 'snapshot-id';

    beforeEach(async () => {
      await SnapshotFactory.createFromExistingSnapshot(snapshotId, targetId);
    });

    fancyIt()(
      'should create a client connected to the right organization',
      () => {
        expect(mockedGetClient).toHaveBeenCalledWith({
          organization: 'target-id',
        });
      }
    );

    fancyIt()('should get the content of an existing snapshot', () => {
      expect(mockedGetSnapshot).toHaveBeenCalledWith('snapshot-id', {
        includeReports: true,
      });
    });
  });

  describe('when the snapshot is created from the organization', () => {
    const targetId = 'target-id';

    beforeEach(async () => {
      const resourcesToExport: SnapshotPullModelResources = {
        [ResourceSnapshotType.field]: ['*'],
        [ResourceSnapshotType.extension]: ['*'],
      };
      await SnapshotFactory.createFromOrg(resourcesToExport, targetId);
    });

    fancyIt()(
      'should create a client connected to the right organization',
      () => {
        expect(mockedGetClient).toHaveBeenCalledWith({
          organization: 'target-id',
        });
      }
    );

    fancyIt()('should create a snapshot with the specified resources', () => {
      expect(mockedCreateFromOrganization).toHaveBeenCalledWith(
        {resourcesToExport: {EXTENSION: ['*'], FIELD: ['*']}},
        expect.objectContaining({})
      );
    });
  });
});
