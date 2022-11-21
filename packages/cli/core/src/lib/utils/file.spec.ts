jest.mock('fs');

import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {fileDepthSearch} from './file.js';
import {readdirSync} from 'fs';
import {getFile} from '@coveo/cli-commons-dev/testUtils/fsUtils';
import {join} from 'path';

const mockedReaddirSync = jest.mocked(readdirSync);

describe('File', () => {
  describe('when the directory contains a single level of JSON files', () => {
    fancyIt()('should return all the JSON files', async () => {
      mockedReaddirSync.mockReturnValueOnce([
        getFile('foo.json'),
        getFile('bar.json'),
        getFile('baz.json'),
      ]);
      expect(fileDepthSearch('/mock').sort()).toEqual([
        join('/mock/bar.json'),
        join('/mock/baz.json'),
        join('/mock/foo.json'),
      ]);
    });
  });

  describe('when the directory contains nested directories', () => {
    fancyIt()('should return all the JSON files', async () => {
      mockedReaddirSync.mockReturnValueOnce([
        getFile('foo.json'),
        getFile('baz.json'),
        getFile('dir1/bar.json'),
        getFile('dir1/dir2/pow.json'),
      ]);
      expect(fileDepthSearch('/mock').sort()).toEqual([
        join('/mock/baz.json'),
        join('/mock/dir1/bar.json'),
        join('/mock/dir1/dir2/pow.json'),
        join('/mock/foo.json'),
      ]);
    });
  });

  describe('when project mix files', () => {
    fancyIt()('should return all the JSON files', async () => {
      mockedReaddirSync.mockReturnValueOnce([
        getFile('text.nojson'),
        getFile('foo.json'),
        getFile('no-extension'),
        getFile('baz.json'),
        getFile('emptydir'),
        getFile('dir1/bar.nojson'),
        getFile('dir1/bar.json'),
        getFile('dir1/dir2/pow.json'),
      ]);

      expect(fileDepthSearch('/mock').sort()).toEqual([
        join('/mock/baz.json'),
        join('/mock/dir1/bar.json'),
        join('/mock/dir1/dir2/pow.json'),
        join('/mock/foo.json'),
      ]);
    });
  });
});
