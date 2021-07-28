jest.mock('fs');
jest.mock('fs-extra');

import {mocked} from 'ts-jest/utils';

import {readdirSync, rmSync} from 'fs';
import {readJSONSync, writeJSONSync} from 'fs-extra';
import {getDirectory, getFile} from '../../../__test__/fsUtils';
import {recursiveDirectoryDiff} from './filesDiffProcessor';
import {join} from 'path';

const mockedReadDir = mocked(readdirSync);
const mockedRm = mocked(rmSync);
const mockedReadJson = mocked(readJSONSync);
const mockedWriteJSON = mocked(writeJSONSync);

describe('#recursiveDirectoryDiff', () => {
  describe('when deleteMissingFile is true', () => {
    it('should delete files present in the currentDir but not in the nextDir', () => {
      mockedReadDir.mockReturnValueOnce([getFile('someFile.json')]);
      mockedReadDir.mockReturnValueOnce([]);

      recursiveDirectoryDiff('currentDir', 'nextDir', true);

      expect(mockedRm).toHaveBeenCalledWith(
        join('currentDir', 'someFile.json')
      );
    });
    it.todo(
      'should delete keys present in the currentDir but not in the nextDir'
    );
  });

  describe('when deleteMissingFile is false', () => {
    it.todo(
      'should preserve files present in the currentDir but not in the nextDir'
    );
    it.todo(
      'should preserve keys present in the currentDir but not in the nextDir'
    );
  });

  it.todo('should check files in sub-directories');

  it.todo(
    'should create files present in the nextDir but not in the currentDir'
  );
  it.todo(
    'should create keys present in the nextDir but not in the currentDir'
  );
  it.todo(
    'should replace the value of keys present in the nextDir and in the currentDir'
  );
});
