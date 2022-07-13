jest.mock('axios');
jest.mock('fs-extra');

import {existsSync, readdirSync, rmSync, writeFileSync} from 'fs-extra';
import {getDirectory} from '../../../__test__/fsUtils';
import {fancyIt} from '../../../__test__/it';
import {SnapshotDiffReporter} from './diffReporter';
import {
  getReportWithChanges,
  getReportWithoutChanges,
} from '../../../__stub__/resourceSnapshotDiffModel';
import {resolve, join} from 'path';
import axios from 'axios';
import {Dirent} from 'fs';

describe('SnapshotDiffReporter', () => {
  const Blob = jest.fn();
  const fakeBlob: Blob = new Blob();

  const mockedAxios = jest.mocked(axios, true);
  const mockedAxiosGet = jest.fn();
  const mockedExistsSync = jest.mocked(existsSync);
  const mockedReaddirSync = jest.mocked(readdirSync);
  const mockedRmSync = jest.mocked(rmSync);
  const mockedWriteFileSync = jest.mocked(writeFileSync);

  const projectPath = 'my/awesome/path';
  let alreadyExistingPreview: boolean;

  const mockReadDirSync = () => {
    const dirs = new Array<Dirent>();
    if (alreadyExistingPreview) {
      dirs.push(getDirectory('some-snapshot-id'));
    }
    mockedReaddirSync.mockReturnValueOnce(dirs);
  };

  const mockExistsSync = () => {
    mockedExistsSync.mockReturnValue(true);
  };

  const mockAxios = () => {
    mockedAxiosGet.mockResolvedValue({
      data: 'the diff',
    });
    mockedAxios.get.mockImplementation(mockedAxiosGet);
  };

  const defaultMocks = () => {
    mockExistsSync();
    mockReadDirSync();
    mockAxios();
  };

  beforeAll(() => {
    alreadyExistingPreview = false;
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

  describe('when there is already a preview stored', () => {
    beforeAll(() => {
      alreadyExistingPreview = true;
    });

    afterAll(() => {
      alreadyExistingPreview = false;
    });

    fancyIt()('should delete the exceeding preview directory', async () => {
      const viewer = new SnapshotDiffReporter(
        getReportWithChanges('some-snapshot-id'),
        projectPath
      );
      await viewer.preview();

      expect(mockedReaddirSync).toBeCalledWith(join(projectPath, 'preview'), {
        withFileTypes: true,
      });
      expect(mockedRmSync).toHaveBeenCalledTimes(1);
      expect(mockedRmSync).toHaveBeenCalledWith(
        join(projectPath, 'preview', 'some-snapshot-id'),
        expect.anything()
      );
    });
  });

  describe('when no preview has been done yet', () => {
    beforeEach(async () => {
      mockedExistsSync.mockReturnValueOnce(false);
      const viewer = new SnapshotDiffReporter(
        getReportWithChanges('some-snapshot-id'),
        projectPath
      );
      await viewer.preview();
    });

    fancyIt()('should check for existing preview', async () => {
      expect(mockedExistsSync).toBeCalledWith(join(projectPath, 'preview'));
    });

    fancyIt()('should not read preview dir', async () => {
      expect(mockedRmSync).not.toHaveBeenCalled();
    });

    fancyIt()('should not delete any preview directories', async () => {
      expect(mockedRmSync).not.toHaveBeenCalled();
    });
  });

  describe('when calling #preview', () => {
    describe('when there is at least on diff to preview', () => {
      beforeEach(async () => {
        const viewer = new SnapshotDiffReporter(
          getReportWithChanges('some-snapshot-id'),
          projectPath
        );
        await viewer.preview();
      });

      fancyIt()('should download resources diffs', async () => {
        const getOptions = {method: 'GET', responseType: 'blob'};
        expect(mockedAxiosGet).toHaveBeenCalledTimes(2);
        expect(mockedAxiosGet).toHaveBeenNthCalledWith(
          1,
          'download-url-1',
          getOptions
        );
        expect(mockedAxiosGet).toHaveBeenNthCalledWith(
          2,
          'download-url-2',
          getOptions
        );
      });

      fancyIt()('should write diff to disk', async () => {
        const diffPath = join(projectPath, 'preview', 'some-snapshot-id');
        expect(mockedWriteFileSync).toHaveBeenCalledTimes(2);
        expect(mockedWriteFileSync).toHaveBeenNthCalledWith(
          1,
          join(diffPath, 'EXTENSION.patch'),
          expect.anything()
        );
        expect(mockedWriteFileSync).toHaveBeenNthCalledWith(
          2,
          join(diffPath, 'FIELD.patch'),
          expect.anything()
        );
      });
    });

    describe('when there are no diff to preview', () => {
      beforeEach(async () => {
        const viewer = new SnapshotDiffReporter(
          getReportWithoutChanges('some-snapshot-id'),
          projectPath
        );
        await viewer.preview();
      });

      fancyIt()('It should not download', () => {
        expect(mockedAxiosGet).not.toHaveBeenCalled();
      });

      fancyIt()('It should not write anything to disk', () => {
        expect(mockedWriteFileSync).not.toHaveBeenCalled();
      });
    });
  });
});
