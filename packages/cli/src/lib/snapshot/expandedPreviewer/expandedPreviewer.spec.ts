jest.mock('fs');
jest.mock('fs-extra');
jest.mock('../../project/project');
jest.mock('../snapshotFactory');
jest.mock('../../utils/process');
jest.mock('./filesDiffProcessor');
import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';
import {Dirent, mkdirSync, readdirSync, rmSync} from 'fs';
import {join} from 'path';

import {mocked} from 'ts-jest/utils';
import {getSuccessReport} from '../../../__stub__/resourceSnapshotsReportModel';
import {ExpandedPreviewer} from './expandedPreviewer';
import {Project} from '../../project/project';
import {SnapshotFactory} from '../snapshotFactory';
import {Snapshot} from '../snapshot';
import {spawnProcess} from '../../utils/process';
import {recursiveDirectoryDiff} from './filesDiffProcessor';

describe('ExpandedPreviewer', () => {
  const getDirectory = (name?: string) => {
    const dirent = new Dirent();
    dirent.isDirectory = () => true;
    dirent.isFile = () => false;
    if (name) {
      dirent.name = name;
    }
    return dirent;
  };

  const Blob = jest.fn();
  const fakeBlob: Blob = new Blob();

  const mockedRecursiveDirectoryDiff = mocked(recursiveDirectoryDiff);
  const mockedReaddirSync = mocked(readdirSync);
  const mockedRmSync = mocked(rmSync);
  const mockedMkdirSync = mocked(mkdirSync);
  const mockedSpawnProcess = mocked(spawnProcess);
  const mockedProject = mocked(Project);
  const mockedProjectRefresh = jest.fn();
  const mockedSnapshotFactory = mocked(SnapshotFactory, true);
  const mockedSnapshotDownload = jest.fn().mockReturnValue(fakeBlob);

  let nbOfExistingPreview: number;
  const mockExistingPreviews = () => {
    const dirs = new Array<Dirent>();
    for (let i = 0; i < nbOfExistingPreview; i++) {
      dirs.push(getDirectory(`someOrgId-${i}`));
    }
    mockedReaddirSync.mockReturnValueOnce(dirs);
  };

  const mockProject = () => {
    mockedProject.mockImplementation(
      (path: string) =>
        ({
          pathToProject: path,
          refresh: mockedProjectRefresh,
        } as unknown as Project)
    );
  };

  const mockSnapshotFactory = async () => {
    mockedSnapshotFactory.createFromOrg.mockReturnValue(
      Promise.resolve({
        download: mockedSnapshotDownload,
      } as unknown as Snapshot)
    );
  };

  const defaultMocks = () => {
    mockExistingPreviews();
    mockProject();
    mockSnapshotFactory();
    jest.spyOn(Date, 'now').mockImplementation(() => 42);
  };

  beforeAll(() => {
    nbOfExistingPreview = 4;
  });

  beforeEach(() => {
    defaultMocks();
  });

  afterEach(() => {
    mockedReaddirSync.mockReset();
    mockedRmSync.mockReset();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('when there are 5 expanded preview stored or more', () => {
    beforeAll(() => {
      nbOfExistingPreview = 8;
    });

    afterAll(() => {
      nbOfExistingPreview = 4;
    });

    it('should delete the exceeding preview directories', async () => {
      const expandedPreviewer = new ExpandedPreviewer(
        getSuccessReport('some-id', ResourceSnapshotsReportType.DryRun),
        'someorg',
        'my/awesome/path',
        false
      );
      await expandedPreviewer.preview();

      expect(mockedReaddirSync).toBeCalledWith('.coveo/preview', {
        withFileTypes: true,
      });
      expect(mockedRmSync).toHaveBeenCalledTimes(4);
      for (let index = 0; index < 4; index++) {
        expect(mockedRmSync).toHaveBeenNthCalledWith(
          index + 1,
          join('.coveo/preview', `someOrgId-${index}`),
          expect.anything()
        );
      }
    });
  });

  describe('when there are less than 5 expanded preview stored', () => {
    beforeAll(() => {
      nbOfExistingPreview = 4;
    });

    afterAll(() => {
      nbOfExistingPreview = 4;
    });

    it('should not delete any preview directories', async () => {
      const expandedPreviewer = new ExpandedPreviewer(
        getSuccessReport('some-id', ResourceSnapshotsReportType.DryRun),
        'someorg',
        'my/awesome/path',
        false
      );
      await expandedPreviewer.preview();

      expect(mockedReaddirSync).toBeCalledWith('.coveo/preview', {
        withFileTypes: true,
      });
      expect(mockedRmSync).not.toHaveBeenCalled();
    });
  });

  describe('when shouldDelete is false', () => {
    it('should call the fillDiffProcessor with the proper options', async () => {
      const expandedPreviewer = new ExpandedPreviewer(
        getSuccessReport('some-id', ResourceSnapshotsReportType.DryRun),
        'someorg',
        'my/awesome/path',
        false
      );
      await expandedPreviewer.preview();

      expect(mockedRecursiveDirectoryDiff).toBeCalledWith(
        expect.anything(),
        expect.anything(),
        false
      );
    });
  });

  describe('when shouldDelete is true', () => {
    it('should call the fillDiffProcessor with the proper options', async () => {
      const expandedPreviewer = new ExpandedPreviewer(
        getSuccessReport('some-id', ResourceSnapshotsReportType.DryRun),
        'someorg',
        'my/awesome/path',
        true
      );
      await expandedPreviewer.preview();

      expect(mockedRecursiveDirectoryDiff).toBeCalledWith(
        expect.anything(),
        expect.anything(),
        true
      );
    });
  });

  describe('when calling #preview', () => {
    let fakeReport: ResourceSnapshotsReportModel;
    let expandedPreviewer: ExpandedPreviewer;
    let previewPath: string;

    beforeEach(async () => {
      previewPath = join('.coveo/preview', 'someorg-42');
      fakeReport = getSuccessReport(
        'some-id',
        ResourceSnapshotsReportType.DryRun
      );
      expandedPreviewer = new ExpandedPreviewer(
        fakeReport,
        'someorg',
        'my/awesome/path',
        false
      );
      await expandedPreviewer.preview();
    });

    it('should get a snapshot of the target org', async () => {
      const previewPath = join('.coveo', 'preview', 'someorg-42');
      expect(mockedMkdirSync).toHaveBeenCalledWith(previewPath, {
        recursive: true,
      });

      expect(mockedProject).toHaveBeenCalledWith(previewPath);
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        Object.keys(fakeReport.resourceOperationResults),
        'someorg'
      );
      expect(mockedProjectRefresh).toHaveBeenCalledWith(fakeBlob);
    });

    it('should commit the snapshot of the target org', async () => {
      expect(mockedSpawnProcess).toHaveBeenNthCalledWith(1, 'git', ['init'], {
        cwd: previewPath,
        stdio: 'ignore',
      });
      expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
        2,
        'git',
        ['add', '.'],
        {
          cwd: previewPath,
          stdio: 'ignore',
        }
      );
      expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
        3,
        'git',
        ['commit', '--message=someorg currently'],
        {
          cwd: previewPath,
          stdio: 'ignore',
        }
      );
    });

    it('should write the diff between the snapshot of the target org and the snapshot on file', async () => {
      expect(mockedRecursiveDirectoryDiff).toBeCalledWith(
        join('.coveo/preview', 'someorg-42', 'resources'),
        'my/awesome/path',
        expect.anything()
      );
    });

    it('should commit the diff', () => {
      expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
        4,
        'git',
        ['add', '.'],
        {
          cwd: previewPath,
          stdio: 'ignore',
        }
      );
      expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
        5,
        'git',
        ['commit', '--message=someorg after snapshot application'],
        {
          cwd: previewPath,
          stdio: 'ignore',
        }
      );
    });
  });

  // it("should replace the value of the 'before' snapshot with the one of the applied snapshot", async () => {
  //   const fakeReport = getSuccessReport(
  //     'some-id',
  //     ResourceSnapshotsReportType.DryRun
  //   );
  //   const expandedPreviewer = new ExpandedPreviewer(
  //     fakeReport,
  //     'someorg',
  //     'my/awesome/path',
  //     false
  //   );
  //   await expandedPreviewer.preview();

  //   expect(mockedReaddirSync).toHaveBeenNthCalledWith(2, 'my/awesome/path', {
  //     withFileTypes: true,
  //   });

  //   expect(mockedReadJsonSync).toHaveBeenNthCalledWith(
  //     1,
  //     join('my/awesome/path', 'myTestFile.json')
  //   );
  //   expect(mockedReadJsonSync).toHaveBeenNthCalledWith(
  //     2,
  //     resolve(
  //       join(
  //         '.coveo/preview',
  //         'someorg-42',
  //         'resources',
  //         'recursionTest',
  //         'myTestFile.json'
  //       )
  //     )
  //   );
  // });
});
