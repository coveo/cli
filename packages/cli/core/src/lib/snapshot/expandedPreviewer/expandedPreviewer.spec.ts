jest.mock('node:fs');
jest.mock('@coveo/cli-commons/utils/ux');

const mockedUxInfo = jest.fn();
jest.mock('@oclif/core', () => ({
  ux: {info: mockedUxInfo},
}));

jest.mock('./filesDiffProcessor');
jest.mock('../snapshotFactory');
jest.mock('../../utils/process');
jest.mock('../../project/project');

import {Dirent, existsSync, mkdirSync, readdirSync, rmSync} from 'node:fs';
import {join, resolve} from 'node:path';

import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportType,
} from '@coveo/platform-client';
import {getDirectory} from '@coveo/cli-commons-dev/testUtils/fsUtils';

import {startSpinner, stopSpinner} from '@coveo/cli-commons/utils/ux';

import {recursiveDirectoryDiff} from './filesDiffProcessor';

import {ExpandedPreviewer} from './expandedPreviewer';
import {SnapshotFactory} from '../snapshotFactory';
import {Snapshot} from '../snapshot';
import {Project} from '../../project/project';
import {spawnProcess, spawnProcessOutput} from '../../utils/process';
import {getSuccessReport} from '../../../__stub__/resourceSnapshotsReportModel';

describe('ExpandedPreviewer', () => {
  const Blob = jest.fn();
  const fakeBlob: Blob = new Blob();

  jest.mocked(startSpinner);
  const mockedStopSpinner = jest.mocked(stopSpinner);
  const mockedRecursiveDirectoryDiff = jest.mocked(recursiveDirectoryDiff);
  const mockedExistsSync = jest.mocked(existsSync);
  const mockedReaddirSync = jest.mocked(readdirSync);
  const mockedRmSync = jest.mocked(rmSync);
  const mockedMkdirSync = jest.mocked(mkdirSync);
  const mockedSpawnProcess = jest.mocked(spawnProcess);
  const mockedSpawnProcessOutput = jest.mocked(spawnProcessOutput);
  const mockedProject = jest.mocked(Project);
  const mockedProjectRefresh = jest.fn();
  const mockedSnapshotFactory = jest.mocked(SnapshotFactory);
  const mockedSnapshotDownload = jest.fn().mockReturnValue(fakeBlob);
  const mockedSnapshotDelete = jest.fn();

  let nbOfExistingPreview: number;
  const mockExistingPreviews = () => {
    const dirs = new Array<Dirent>();
    for (let i = 0; i < nbOfExistingPreview; i++) {
      dirs.push(getDirectory(`someOrgId-${i}`));
    }
    mockedReaddirSync.mockReturnValueOnce(dirs);
  };

  const mockExistsSync = () => {
    mockedExistsSync.mockReturnValue(true);
  };

  const mockProject = () => {
    mockedProject.mockImplementation(
      (path: string) =>
        ({
          pathToProject: path,
          resourcePath: resolve(join(path, 'resources')),
          refresh: mockedProjectRefresh,
        } as unknown as Project)
    );
  };

  const mockSnapshotFactory = async () => {
    mockedSnapshotFactory.createFromOrg.mockReturnValue(
      Promise.resolve({
        download: mockedSnapshotDownload,
        delete: mockedSnapshotDelete,
      } as unknown as Snapshot)
    );
  };

  const mockSpawnProcess = () => {
    mockedSpawnProcessOutput.mockResolvedValue({
      exitCode: 'ENOENT',
      stderr: '',
      stdout: '',
    });
  };

  const defaultMocks = () => {
    mockExistsSync();
    mockExistingPreviews();
    mockProject();
    mockSnapshotFactory();
    mockSpawnProcess();
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
        new Project('my/awesome/path'),
        false
      );

      await expandedPreviewer.preview();

      expect(mockedReaddirSync).toBeCalledWith(join('.coveo/preview'), {
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

  describe('when no preview has been done yet', () => {
    it('should not delete any preview directories', async () => {
      mockedExistsSync.mockReturnValueOnce(false);
      const expandedPreviewer = new ExpandedPreviewer(
        getSuccessReport('some-id', ResourceSnapshotsReportType.DryRun),
        'someorg',
        new Project('my/awesome/path'),
        false
      );
      await expandedPreviewer.preview();

      expect(mockedExistsSync).toBeCalledWith(join('.coveo/preview'));
      expect(mockedReaddirSync).not.toBeCalled();
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
        new Project('my/awesome/path'),
        false
      );
      await expandedPreviewer.preview();

      expect(mockedReaddirSync).toBeCalledWith(join('.coveo/preview'), {
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
        new Project('my/awesome/path'),
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
        new Project('my/awesome/path'),
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
    const previewPath = join('.coveo/preview', 'someorg-42');

    beforeEach(async () => {
      fakeReport = getSuccessReport(
        'some-id',
        ResourceSnapshotsReportType.DryRun
      );
      const expandedPreviewer = new ExpandedPreviewer(
        fakeReport,
        'someorg',
        new Project('my/awesome/path'),
        false
      );
      await expandedPreviewer.preview();
    });

    it('should stop the spinner before printing more info', () => {
      expect(mockedStopSpinner.mock.invocationCallOrder[0]).toBeLessThan(
        mockedUxInfo.mock.invocationCallOrder[0]
      );
    });

    it('should get a snapshot of the target org', async () => {
      const previewPath = join('.coveo', 'preview', 'someorg-42');
      expect(mockedMkdirSync).toHaveBeenCalledWith(previewPath, {
        recursive: true,
      });

      expect(mockedProject).toHaveBeenCalledWith(resolve(previewPath));
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        fakeReport.resourceOperationResults,
        'someorg'
      );
      expect(mockedSnapshotDownload).toHaveBeenCalled();
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

    it('should get the commit hash', async () => {
      expect(mockedSpawnProcessOutput).toHaveBeenCalledWith(
        'git',
        ['rev-parse', '--short', 'HEAD'],
        {
          cwd: previewPath,
        }
      );
    });

    it('should write the diff between the snapshot of the target org and the snapshot on file', async () => {
      expect(mockedRecursiveDirectoryDiff).toBeCalledWith(
        join('.coveo/preview', 'someorg-42', 'resources'),
        join('my/awesome/path', 'resources'),
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

    it('should delete the snapshot created in the target org', () => {
      expect(mockedSnapshotDelete).toHaveBeenCalled();
    });
  });
});
