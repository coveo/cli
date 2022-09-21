jest.mock('fs', () => ({
  __esModule: true,
  ...jest.requireActual('memfs'),
}));

import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {fileDepthSearch} from './file';
import {vol} from 'memfs';

describe('File', () => {
  beforeEach(() => {
    vol.reset();
  });

  describe('when the directory contains a single level of JSON files', () => {
    fancyIt()('should return all the JSON files', async () => {
      vol.fromJSON(
        {
          'foo.json': '',
          'bar.json': '',
          'baz.json': '',
        },
        '/mock' // current working directory
      );
      expect(fileDepthSearch('/mock').sort()).toEqual([
        '/mock/bar.json',
        '/mock/baz.json',
        '/mock/foo.json',
      ]);
    });
  });

  describe('when the directory contains nested directories', () => {
    fancyIt()('should return all the JSON files', async () => {
      vol.fromJSON(
        {
          'foo.json': '',
          'baz.json': '',
          'dir1/bar.json': '',
          'dir1/dir2/pow.json': '',
        },
        '/mock'
      );
      expect(fileDepthSearch('/mock').sort()).toEqual([
        '/mock/baz.json',
        '/mock/dir1/bar.json',
        '/mock/dir1/dir2/pow.json',
        '/mock/foo.json',
      ]);
    });
  });

  describe('when the directory contains no files', () => {
    fancyIt()('should return all the JSON files', async () => {
      vol.fromJSON(
        {
          dir1: null,
        },
        '/mock'
      );
      expect(fileDepthSearch('/mock')).toEqual([]);
    });
  });

  describe('when project mix files', () => {
    fancyIt()('should return all the JSON files', async () => {
      vol.fromJSON(
        {
          'text.txt': '',
          'foo.json': '',
          'no-extension': '',
          'baz.json': '',
          'dir1/bar.txt': '',
          'dir1/bar.json': '',
          'dir1/dir2': null,
          'dir1/dir2/pow.json': '',
        },
        '/mock'
      );
      expect(fileDepthSearch('/mock').sort()).toEqual([
        '/mock/baz.json',
        '/mock/dir1/bar.json',
        '/mock/dir1/dir2/pow.json',
        '/mock/foo.json',
      ]);
    });
  });
});
