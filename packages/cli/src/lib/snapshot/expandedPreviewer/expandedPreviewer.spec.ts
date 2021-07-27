jest.mock('fs');
jest.mock('fs-extra');
jest.mock('../project/project');
jest.mock('./snapshotFactory');
jest.mock('../utils/process');
import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {Dirent, mkdirSync, readdirSync, rmSync, existsSync} from 'fs';
import {join, resolve} from 'path';

import {mocked} from 'ts-jest/utils';
import {getSuccessReport} from '../../../__stub__/resourceSnapshotsReportModel';
import {ExpandedPreviewer} from './expandedPreviewer';
import {Project} from '../../project/project';
import {SnapshotFactory} from '../snapshotFactory';
import {Snapshot} from '../snapshot';
import {spawnProcess} from '../../utils/process';
import {readJsonSync} from 'fs-extra';

describe('ExpandedPreviewer', () => {
  const getDirectory = (name?: string) => getDirent('dir', name);
  const getFile = (name?: string) => getDirent('file', name);

  const getDirent = (fileOrDirectory: 'file' | 'dir', name?: string) => {
    const dirent = new Dirent();
    const isFile = fileOrDirectory === 'file';
    dirent.isDirectory = isFile ? () => false : () => true;
    dirent.isFile = isFile ? () => true : () => false;
    if (name) {
      dirent.name = name;
    }
    return dirent;
  };

  const Blob = jest.fn();
  const fakeBlob: Blob = new Blob();

  const mockedReaddirSync = mocked(readdirSync);
  const mockedExistSync = mocked(existsSync);
  const mockedRmSync = mocked(rmSync);
  const mockedMkdirSync = mocked(mkdirSync);
  const mockedReadJsonSync = mocked(readJsonSync);
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

  const mockPreviewFiles = () => {
    mockedReaddirSync.mockReturnValueOnce([getDirectory('recursionTest')]);
    mockedReaddirSync.mockReturnValueOnce([getFile('myTestFile.json')]);
    mockedReadJsonSync.mockReturnValueOnce({
      someKey: 'someValue',
      resources: {
        FIELD: [
          {resourceName: 'resourceA', someData: 'foo'},
          {resourceName: 'resourceB', someData: 'foo'},
        ],
      },
    });
    mockedReadJsonSync.mockReturnValueOnce({
      someKey: 'someValue',
      resources: {
        FIELD: [
          {resourceName: 'resourceB', someData: 'bar'},
          {resourceName: 'resourceC', someData: 'bar'},
        ],
      },
    });
    mockedExistSync.mockReturnValueOnce(true);
  };

  const mockProject = () => {
    mockedProject.mockImplementation(
      () =>
        ({
          pathToProject: 'some/path',
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
    mockPreviewFiles();
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
    it.skip('should not delete missing resources', async () => {
      const expandedPreviewer = new ExpandedPreviewer(
        getSuccessReport('some-id', ResourceSnapshotsReportType.DryRun),
        'someorg',
        'my/awesome/path',
        false
      );
      await expandedPreviewer.preview();
    });

    it.todo('should not delete missing resourceType/file');
  });

  describe('when shouldDelete is true', () => {
    it.todo('should delete missing resources');
    it.todo('should delete missing resourceType/file');
  });

  it('should initialize the project', async () => {
    const fakeReport = getSuccessReport(
      'some-id',
      ResourceSnapshotsReportType.DryRun
    );
    const expandedPreviewer = new ExpandedPreviewer(
      fakeReport,
      'someorg',
      'my/awesome/path',
      false
    );
    await expandedPreviewer.preview();

    const previewPath = resolve(join('.coveo', 'preview', 'someorg-42'));
    expect(mockedMkdirSync).toHaveBeenCalledWith(previewPath, {
      recursive: true,
    });

    expect(mockedProject).toHaveBeenCalledWith(previewPath);
    expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
      Object.keys(fakeReport.resourceOperationResults),
      'someorg'
    );
    expect(mockedProjectRefresh).toHaveBeenCalledWith(fakeBlob);

    expect(mockedSpawnProcess).toHaveBeenNthCalledWith(1, 'git', ['init'], {
      cwd: 'some/path',
      stdio: 'ignore',
    });
    expect(mockedSpawnProcess).toHaveBeenNthCalledWith(2, 'git', ['add', '.'], {
      cwd: 'some/path',
      stdio: 'ignore',
    });
    expect(mockedSpawnProcess).toHaveBeenNthCalledWith(
      3,
      'git',
      ['commit', '--message=someorg currently'],
      {
        cwd: 'some/path',
        stdio: 'ignore',
      }
    );
  });

  it("should replace the value of the 'before' snapshot with the one of the applied snapshot", async () => {
    const fakeReport = getSuccessReport(
      'some-id',
      ResourceSnapshotsReportType.DryRun
    );
    const expandedPreviewer = new ExpandedPreviewer(
      fakeReport,
      'someorg',
      'my/awesome/path',
      false
    );
    await expandedPreviewer.preview();

    expect(mockedReaddirSync).toHaveBeenNthCalledWith(2, 'my/awesome/path', {
      withFileTypes: true,
    });

    expect(mockedReadJsonSync).toHaveBeenNthCalledWith(
      1,
      join('my/awesome/path', 'myTestFile.json')
    );
    expect(mockedReadJsonSync).toHaveBeenNthCalledWith(
      2,
      resolve(
        join(
          '.coveo/preview',
          'someorg-42',
          'resources',
          'recursionTest',
          'myTestFile.json'
        )
      )
    );
  });
});
