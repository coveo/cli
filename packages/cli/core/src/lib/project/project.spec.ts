jest.mock('@coveord/platform-client');
jest.mock('fs');
jest.mock('archiver');
jest.mock('fs-extra');
jest.mock('extract-zip');
import {
  existsSync,
  createWriteStream,
  WriteStream,
  unlinkSync,
  writeFileSync,
  readdirSync,
  rmSync,
} from 'fs';
import {
  writeJSONSync,
  readJsonSync,
  pathExistsSync,
  ensureDirSync,
} from 'fs-extra';
import {Project} from './project';
import {join, resolve} from 'path';
import archiver, {Archiver} from 'archiver';
import extract from 'extract-zip';
import {EventEmitter, Writable} from 'stream';
import {getDirectory, getFile} from '../../__test__/fsUtils';
import {fancyIt} from '@coveo/cli-commons-dev/lib/testUtils/it';

const mockedRmSync = jest.mocked(rmSync);
const mockedExistSync = jest.mocked(existsSync);
const mockedReadDirSync = jest.mocked(readdirSync);
const mockedUnlinkSync = jest.mocked(unlinkSync);
const mockedCreateWriteStream = jest.mocked(createWriteStream);
const mockedArchiver = jest.mocked(archiver);
const mockedExtract = jest.mocked(extract);
const mockedPipe = jest.fn();
const mockedPassDirectory = jest.fn();
const mockedFinalize = jest.fn();
const mockedCreateFileSync = jest.mocked(ensureDirSync);
const mockedWriteJSONSync = jest.mocked(writeJSONSync);
const mockedReadJSONSync = jest.mocked(readJsonSync);
const mockedPathExistsSync = jest.mocked(pathExistsSync);

mockedArchiver.mockImplementation(
  () =>
    ({
      on: () => {},
      pipe: mockedPipe,
      directory: mockedPassDirectory,
      finalize: mockedFinalize,
    } as unknown as Archiver)
);

mockedExtract.mockImplementation(() => Promise.resolve());
mockedReadDirSync.mockImplementation(() => []);
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

function doMockArchiverAsThrower() {
  let eventEmitter: EventEmitter;
  mockedArchiver.mockImplementationOnce(() => {
    eventEmitter = new EventEmitter();
    const archiver: Archiver = eventEmitter as Archiver;
    archiver.pipe = jest.fn();
    archiver.directory = jest.fn();
    archiver.finalize = jest.fn();
    return eventEmitter as Archiver;
  });
  return (err: unknown) => eventEmitter.emit('error', err);
}

describe('Project', () => {
  const pathToResources = resolve('dummy', 'path', 'resources');
  const pathToZip = resolve('dummy', 'path', 'snapshot.zip');

  const projectCreator = (orgId?: string) =>
    new Project(resolve('dummy/path'), orgId);

  beforeAll(() => {
    doMockCreateWriteStream();
    mockedReadJSONSync.mockReturnValue({});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('if the project is invalid', () => {
    describe('#compressResources', () => {
      fancyIt()('should ensure resources folder exists', async () => {
        doMockFileDoesNotExists('resources');
        const project = projectCreator();

        await expect(() => project.compressResources()).rejects.toThrow(
          new Error(
            `${resolve(
              'dummy/path'
            )} is not a valid project: Does not contain any resources folder`
          )
        );

        expect(mockedExistSync).toHaveBeenNthCalledWith(
          2,
          resolve('dummy/path', 'resources')
        );
      });

      fancyIt()('should ensure .coveo hidden folder exists', async () => {
        doMockFileDoesNotExists('_');
        const project = projectCreator();
        doMockFileDoesNotExists('.coveo');

        await expect(() => project.compressResources()).rejects.toThrow(
          new Error(
            `${resolve(
              'dummy/path'
            )} is not a valid project: Does not contain any .coveo folder`
          )
        );

        expect(mockedExistSync).toHaveBeenNthCalledWith(
          3,
          resolve('dummy/path', '.coveo')
        );
      });

      fancyIt()('should not check for the manifest', async () => {
        doMockFileDoesNotExists('resources');
        const project = projectCreator();
        mockedReadJSONSync.mockReturnValueOnce({orgId: 'someOrgId'});

        try {
          await project.compressResources();
        } catch (error) {}

        expect(mockedWriteJSONSync).not.toBeCalled();
      });
    });
  });

  fancyIt()('should create .coveo project if absent', () => {
    doMockFileDoesNotExists('.coveo');
    mockedPathExistsSync.mockReturnValueOnce(false);
    projectCreator();
    expect(mockedCreateFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.coveo')
    );
    expect(mockedWriteJSONSync).toHaveBeenCalledWith(
      expect.stringContaining(join('.coveo/config.json')),
      expect.objectContaining({version: 1})
    );
  });

  fancyIt()(
    'should use the provided orgId to initialize project if .coveo project is absent',
    () => {
      doMockFileDoesNotExists('.coveo');
      mockedPathExistsSync.mockReturnValueOnce(false);
      projectCreator('testorgid');
      expect(mockedCreateFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.coveo')
      );
      expect(mockedWriteJSONSync).toHaveBeenCalledWith(
        expect.stringContaining(join('.coveo/config.json')),
        expect.objectContaining({version: 1, organization: 'testorgid'})
      );
    }
  );

  describe('if the project is valid', () => {
    let project: Project;

    beforeEach(async () => {
      doMockValidProject();

      project = projectCreator();
    });

    describe('#compressResources', () => {
      fancyIt()(
        'should create a write stream the appropriate path to the zip file',
        async () => {
          await project.compressResources();

          expect(mockedCreateWriteStream).toHaveBeenCalledWith(pathToZip);
        }
      );

      fancyIt()('should append files from the resource directory', async () => {
        await project.compressResources();

        const putTheContentAtTheRootOfTheArchive = false;
        expect(mockedPassDirectory).toHaveBeenCalledWith(
          pathToResources,
          putTheContentAtTheRootOfTheArchive
        );
      });

      fancyIt()(
        'should finalize when there are no more resources to zip',
        async () => {
          await project.compressResources();

          expect(mockedFinalize).toHaveBeenCalledTimes(1);
        }
      );

      fancyIt()('should restore the manifest file if it exists', async () => {
        mockedReadJSONSync.mockReturnValueOnce({orgId: 'someOrgId'});

        await project.compressResources();

        expect(mockedRmSync).toBeCalledTimes(1);
        expect(mockedWriteJSONSync).toBeCalledWith(
          join(pathToResources, 'manifest.json'),
          expect.objectContaining({orgId: 'someOrgId'})
        );
      });

      fancyIt()(
        'should not restore the manifest file if it did not exists',
        async () => {
          mockedReadJSONSync.mockReturnValueOnce(null);

          await project.compressResources();

          expect(mockedRmSync).toBeCalledTimes(1);
          expect(mockedWriteJSONSync).not.toBeCalled();
        }
      );

      describe('if archiver fails', () => {
        let callToFailArchiver: (err: unknown) => void;
        beforeAll(() => {
          callToFailArchiver = doMockArchiverAsThrower();
        });

        it('should rejects', async () => {
          const compressResourcesPromise = project.compressResources();
          const errorData = 'someError';

          callToFailArchiver(errorData);

          await expect(compressResourcesPromise).rejects.toThrow(errorData);
        });

        fancyIt()('should restore the manifest file if it exists', async () => {
          mockedReadJSONSync.mockReturnValueOnce({orgId: 'someOrgId'});

          await project.compressResources();

          expect(mockedRmSync).toBeCalledTimes(1);
          expect(mockedWriteJSONSync).toBeCalledWith(
            join(pathToResources, 'manifest.json'),
            expect.objectContaining({orgId: 'someOrgId'})
          );
        });

        fancyIt()(
          'should not restore the manifest file if it did not exists',
          async () => {
            mockedReadJSONSync.mockReturnValueOnce(null);

            await project.compressResources();

            expect(mockedRmSync).toBeCalledTimes(1);
            expect(mockedWriteJSONSync).not.toBeCalled();
          }
        );
      });
    });

    fancyIt()(
      '#deleteTemporaryZipFile should delete the temporary a zip file',
      async () => {
        await project.compressResources();

        project.deleteTemporaryZipFile();
        expect(mockedUnlinkSync).toHaveBeenCalledWith(pathToZip);
      }
    );

    describe('#refresh', () => {
      const mockedWriteFileSync = jest.mocked(writeFileSync);

      const Blob = jest.fn().mockImplementation(() => ({
        arrayBuffer: () => new ArrayBuffer(0),
      }));
      const mockedDataView = jest.fn().mockImplementation(() => ({}));
      let trueDataView: DataViewConstructor;
      beforeAll(() => {
        trueDataView = DataView;
        global.DataView = mockedDataView;
      });

      afterAll(() => {
        global.DataView = trueDataView;
      });

      fancyIt()('should write the zip on disk', async () => {
        const project = projectCreator();
        const fakeBlob = new Blob();
        await project.refresh(fakeBlob);

        expect(mockedDataView).toHaveBeenCalled();

        expect(mockedWriteFileSync).toHaveBeenCalledWith(
          resolve('dummy/path', 'snapshot.zip'),
          mockedDataView.mock.instances[0]
        );
      });

      fancyIt()('should extract the zip in the resource folder', async () => {
        const project = projectCreator();
        const fakeBlob = new Blob();
        await project.refresh(fakeBlob);

        expect(mockedExtract).toHaveBeenCalledWith(
          resolve('dummy/path', 'snapshot.zip'),
          {dir: resolve('dummy/path', 'resources')}
        );
      });

      fancyIt()(
        'should format every JSON files in the resource folder',
        async () => {
          const project = projectCreator();
          const fakeBlob = new Blob();
          mockedReadJSONSync
            .mockReturnValueOnce({call: 1})
            .mockReturnValueOnce({call: 2});
          mockedReadDirSync
            .mockImplementationOnce(() => [
              getFile('somefile.json'),
              getFile('somefile.notJson'),
              getDirectory('someDirectory'),
            ])
            .mockImplementationOnce(() => [getFile('someFileInASubDir.json')]);

          await project.refresh(fakeBlob);

          expect(mockedReadDirSync).toHaveBeenNthCalledWith(
            1,
            resolve('dummy/path', 'resources'),
            {withFileTypes: true}
          );
          expect(mockedReadDirSync).toHaveBeenNthCalledWith(
            2,
            resolve('dummy/path', 'resources', 'someDirectory'),
            {withFileTypes: true}
          );
          expect(mockedReadJSONSync).toHaveBeenCalledTimes(2);
          expect(mockedReadJSONSync).toHaveBeenCalledWith(
            resolve('dummy/path', 'resources', 'somefile.json')
          );
          expect(mockedReadJSONSync).toHaveBeenCalledWith(
            resolve(
              'dummy/path',
              'resources',
              'someDirectory',
              'someFileInASubDir.json'
            )
          );
          expect(mockedWriteJSONSync).toHaveBeenCalledTimes(2);
          expect(mockedWriteJSONSync).toHaveBeenCalledWith(
            resolve('dummy/path', 'resources', 'somefile.json'),
            {call: 1},
            {spaces: '\t'}
          );
          expect(mockedWriteJSONSync).toHaveBeenCalledWith(
            resolve(
              'dummy/path',
              'resources',
              'someDirectory',
              'someFileInASubDir.json'
            ),
            {call: 2},
            {spaces: '\t'}
          );
        }
      );

      fancyIt()(
        '#writeResourcesManifest should overwrite the existing orgId',
        () => {
          mockedReadJSONSync.mockReturnValueOnce({orgId: 'foobar'});
          project.writeResourcesManifest('someOrgId');
          expect(mockedWriteJSONSync).toBeCalledWith(
            join(pathToResources, 'manifest.json'),
            expect.objectContaining({orgId: 'someOrgId'})
          );
        }
      );

      fancyIt()(
        '#writeResourcesManifest should write a new manifest if none existed',
        () => {
          mockedReadJSONSync.mockReturnValueOnce(null);
          project.writeResourcesManifest('someOrgId');
          expect(mockedWriteJSONSync).toBeCalledWith(
            join(pathToResources, 'manifest.json'),
            expect.objectContaining({orgId: 'someOrgId'})
          );
        }
      );
    });
  });
});
