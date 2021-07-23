jest.mock('fs');
import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {Dirent, readdirSync, rmSync} from 'fs';
import {join} from 'path';

import {mocked} from 'ts-jest/utils';
import {getSuccessReport} from '../../__stub__/resourceSnapshotsReportModel';
import {ExpandedPreviewer} from './expandedPreviewer';

describe('ExpandedPreviewer', () => {
  const getDirectory = (name?: string) => {
    const dirent = new Dirent();
    dirent.isDirectory = () => true;
    if (name) {
      dirent.name = name;
    }
    return dirent;
  };
  describe('when there are more than 5 expanded preview stored', () => {
    const mockedReaddirSync = mocked(readdirSync);
    const mockedRmSync = mocked(rmSync);

    beforeAll(() => {
      const dirs = new Array<Dirent>();
      for (let i = 0; i < 8; i++) {
        dirs.push(getDirectory(`someOrgId-${i}`));
      }
      mockedReaddirSync.mockReturnValue(dirs);
    });

    afterAll(() => {
      mockedReaddirSync.mockRestore();
      mockedRmSync.mockRestore();
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

  describe('when shouldDelete is false', () => {
    it.todo('should not delete missing resources');
    it.todo('should not delete missing resourceType/file');
  });

  describe('when shouldDelete is true', () => {
    it.todo('should not delete missing resources');
    it.todo('should not delete missing resourceType/file');
  });

  it.todo('should download the before snapshot');
  it.todo('should do two commits');
  it.todo(
    "should replace the value of the 'before' snapshot with the one of the applied snapshot"
  );
});
