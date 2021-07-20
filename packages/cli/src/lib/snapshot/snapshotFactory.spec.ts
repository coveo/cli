jest.mock('../platform/authenticatedClient');
jest.mock('fs');
jest.mock('./snapshot');

import {ResourceSnapshotType} from '@coveord/platform-client';
import {readFileSync} from 'fs';
import {join} from 'path';
import {mocked} from 'ts-jest/utils';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {Snapshot} from './snapshot';
import {SnapshotFactory} from './snapshotFactory';

const mockedReadFileSync = mocked(readFileSync);
const mockedAuthenticatedClient = mocked(AuthenticatedClient, true);
const mockedSnapshot = mocked(Snapshot, true);
const mockedCreateSnapshotFromFile = jest.fn();
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
        createFromFile: mockedCreateSnapshotFromFile,
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

describe('SnapshotFactory', () => {
  beforeAll(() => {
    doMockAuthenticatedClient();
    doMockReadFile();
    doMockSnapshot();
  });

  describe('when the snapshot is created from a ZIP', () => {
    const pathToZip = join('dummy', 'path');

    beforeEach(async () => {
      await SnapshotFactory.createFromZip(pathToZip, 'my-target-org');
    });

    it('should create a client connected to the right organization', () => {
      expect(mockedGetClient).toHaveBeenCalledWith({
        organization: 'my-target-org',
      });
    });

    it('#createSnapshotFromZip should retrieve an authenticated client', () => {
      expect(mockedCreateSnapshotFromFile).toHaveBeenCalledTimes(1);
    });

    it('#createSnapshotFromZip should create a snapshot from Zip with appropriate parameters', () => {
      expect(mockedCreateSnapshotFromFile).toHaveBeenCalledWith(
        Buffer.from('hello there'),
        'ZIP',
        {
          developerNotes: 'cli-created-from-zip',
        }
      );
    });

    it('#createSnapshotFromZip should create a readstream with the appropriate path to zip', () => {
      expect(mockedReadFileSync).toHaveBeenCalledWith(join('dummy', 'path'));
    });
  });

  describe('when the snapshot is created from an exisiting one', () => {
    const targetId = 'target-id';
    const snapshotId = 'snapshot-id';

    beforeEach(async () => {
      await SnapshotFactory.createFromExistingSnapshot(snapshotId, targetId);
    });

    it('should create a client connected to the right organization', () => {
      expect(mockedGetClient).toHaveBeenCalledWith({
        organization: 'target-id',
      });
    });

    it('should get the content of an existing snapshot', () => {
      expect(mockedGetSnapshot).toHaveBeenCalledWith('snapshot-id', {
        includeReports: true,
      });
    });
  });

  describe('when the snapshot is created from the organization', () => {
    const targetId = 'target-id';

    beforeEach(async () => {
      const resourcesToExport: ResourceSnapshotType[] = [
        ResourceSnapshotType.field,
        ResourceSnapshotType.extension,
      ];
      await SnapshotFactory.createFromOrg(resourcesToExport, targetId);
    });

    it('should create a client connected to the right organization', () => {
      expect(mockedGetClient).toHaveBeenCalledWith({
        organization: 'target-id',
      });
    });

    it('should create a snapshot with the specified resources', () => {
      expect(mockedCreateFromOrganization).toHaveBeenCalledWith(
        {resourcesToExport: {EXTENSION: ['*'], FIELD: ['*']}},
        expect.objectContaining({})
      );
    });
  });
});
