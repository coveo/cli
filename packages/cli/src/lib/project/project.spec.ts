jest.mock('@coveord/platform-client');
jest.mock('fs');
jest.mock('archiver');
jest.mock('@oclif/errors');
jest.mock('fs-extra');

import {mocked} from 'ts-jest/utils';
import {existsSync, createWriteStream, WriteStream, unlinkSync} from 'fs';
import {writeJSONSync, pathExistsSync, ensureDirSync} from 'fs-extra';
import {Project} from './project';
import {join} from 'path';
import archiver, {Archiver} from 'archiver';
import {Writable} from 'stream';
import {error} from '@oclif/errors';

const mockedExistSync = mocked(existsSync);
const mockedUnlinkSync = mocked(unlinkSync);
const mockedCreateWriteStream = mocked(createWriteStream);
const mockedArchiver = mocked(archiver);
const mockedPipe = jest.fn();
const mockedPassDirectory = jest.fn();
const mockedFinalize = jest.fn();
const mockedError = mocked(error);
const mockedCreateFileSync = mocked(ensureDirSync);
const mockedJSONSync = mocked(writeJSONSync);
const mockedPathExistsSync = mocked(pathExistsSync);

mockedArchiver.mockImplementation(
  () =>
    ({
      on: () => {},
      pipe: mockedPipe,
      directory: mockedPassDirectory,
      finalize: mockedFinalize,
    } as unknown as Archiver)
);

const doMockValidProject = () => {
  mockedExistSync.mockReturnValue(true);
};

const doMockFileDoesNotExists = (missing: string) => {
  mockedExistSync.mockImplementationOnce((p) => {
    if (p.toString().indexOf(missing) !== -1) {
      return false;
    }
    return true;
  });
};

const doMockCreateWriteStream = () => {
  mockedCreateWriteStream.mockImplementation(() => {
    const writableStream = new Writable();
    writableStream._write = (_chunk, _encoding, next) => next();
    process.nextTick(() => writableStream.emit('close'));
    return writableStream as unknown as WriteStream;
  });
};

describe('Project', () => {
  const projectCreator = () => new Project('dummy/path');

  beforeAll(() => {
    doMockCreateWriteStream();
  });

  describe('if the project is invalid', () => {
    it('should ensure resources folder exists', async () => {
      doMockFileDoesNotExists('resources');
      const project = projectCreator();
      project.compressResources();
      expect(mockedError).toHaveBeenCalledWith(
        new Error(
          'dummy/path is not a valid project: Does not contain any resources folder'
        )
      );
    });

    it('should ensure .coveo hidden folder exists', async () => {
      doMockFileDoesNotExists('_');
      const project = projectCreator();
      doMockFileDoesNotExists('.coveo');
      project.compressResources();
      expect(mockedError).toHaveBeenCalledWith(
        new Error(
          'dummy/path is not a valid project: Does not contain any .coveo folder'
        )
      );
    });
  });

  it('should create .coveo project if absent', () => {
    doMockFileDoesNotExists('.coveo');
    mockedPathExistsSync.mockReturnValueOnce(false);
    projectCreator();
    expect(mockedCreateFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.coveo')
    );
    expect(mockedJSONSync).toHaveBeenCalledWith(
      expect.stringContaining(join('.coveo/config.json')),
      expect.objectContaining({version: 1})
    );
  });

  describe('if the project is valid', () => {
    let pathToResources: string;
    let pathToZip: string;
    let project: Project;

    beforeEach(async () => {
      doMockValidProject();
      pathToResources = join('dummy', 'path', 'resources');
      pathToZip = join('dummy', 'path', 'snapshot.zip');
      project = projectCreator();
      await project.compressResources();
    });

    it('#compressResources should create a write stream the appropriate path to the zip file', () => {
      expect(mockedCreateWriteStream).toHaveBeenCalledWith(pathToZip);
    });

    it('#compressResources should append files from the resource directory', () => {
      const putTheContentAtTheRootOfTheArchive = false;
      expect(mockedPassDirectory).toHaveBeenCalledWith(
        pathToResources,
        putTheContentAtTheRootOfTheArchive
      );
    });

    it('#compressResources should finalize when there are no more resources to zip', () => {
      expect(mockedFinalize).toHaveBeenCalledTimes(1);
    });

    it('#deleteTemporaryZipFile should delete the temporary a zip file', () => {
      project.deleteTemporaryZipFile();
      expect(mockedUnlinkSync).toHaveBeenCalledWith(pathToZip);
    });

    it.todo(
      '#compressResources should reject if the archiver returns an error'
    );
  });
});
