import type {Interfaces} from '@oclif/core';
jest.mock('node:fs');
import {existsSync, mkdirSync} from 'node:fs';
jest.mock('node:child_process');
import {fork, spawnSync} from 'node:child_process';
jest.mock('node:module');
import {createRequire} from 'node:module';
jest.mock('npm-package-arg');
import npa from 'npm-package-arg';
jest.mock('../config/globalConfig');
import globalConfig from '../config/globalConfig';
jest.mock('../utils/os');
import {appendCmdIfWindows} from '../utils/os';
import npf from './npf';
import {resolve} from 'node:path';
import {Result} from 'npm-package-arg';
import {InternalError} from '../errors/internalError';

describe('npf', () => {
  const mockedExistSync = jest.mocked(existsSync);
  const mockedMkdirSync = jest.mocked(mkdirSync);
  const mockedFork = jest.mocked(fork);
  const mockedSpawnSync = jest.mocked(spawnSync);
  const mockedNpa = jest.mocked(npa);
  const mockedAppendCmdIfWindows = jest.mocked(appendCmdIfWindows);
  const mockedGlobalConfig = jest.mocked(globalConfig);
  const mockedCreateRequire = jest.mocked(createRequire);
  let mockedRequire: jest.Mock;
  const mockedRequireResolve = jest.fn();
  const doThrowModuleNotFound = () => {
    const error = new Error();
    Object.assign(error, {code: 'MODULE_NOT_FOUND'});
    throw error;
  };
  const fakeLazyLoadedDepFolderPath = resolve(
    '/i/am/groot/',
    'lazyLoadedDependencies'
  );

  beforeEach(() => {
    mockedGlobalConfig.get.mockReturnValue({
      dataDir: '/i/am/groot/',
    } as Interfaces.Config);
    mockedAppendCmdIfWindows.mockImplementation((input) => `${input}`);
    mockedRequire = jest.fn();
    mockedCreateRequire.mockImplementation(() => {
      Object.assign(mockedRequire, {resolve: mockedRequireResolve});
      return mockedRequire as unknown as NodeRequire;
    });
    mockedRequireResolve.mockImplementation(() => '/some/silly/path.js');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when the packageName can be resolved by npa', () => {
    beforeEach(() => {
      mockedNpa.mockReturnValue({
        name: 'potato',
        saveSpec: '1.2.3',
      } as unknown as Result);
    });

    it('should create a require from the lazyLoaded package.json and resolve the name of the package', () => {
      npf('potato@1.2.3');
      expect(mockedRequireResolve).toBeCalledWith('potato');
    });

    describe('when the lazyLoad npm project does not exists', () => {
      beforeEach(() => {
        mockedExistSync.mockReturnValue(false);
        mockedCreateRequire.mockImplementationOnce(doThrowModuleNotFound);
      });

      it('should initialize the project and install the dependency', () => {
        npf('potato@1.2.3');

        expect(mockedMkdirSync).toBeCalledWith(fakeLazyLoadedDepFolderPath, {
          recursive: true,
        });
        expect(mockedSpawnSync).toHaveBeenNthCalledWith(
          1,
          'npm',
          ['init', '-y'],
          {cwd: fakeLazyLoadedDepFolderPath}
        );
        expect(mockedSpawnSync).toHaveBeenNthCalledWith(
          2,
          'npm',
          ['install', '-E', 'potato@1.2.3'],
          {cwd: fakeLazyLoadedDepFolderPath}
        );
      });
    });

    describe('when the lazyLoad npm project does exists', () => {
      beforeEach(() => {
        mockedExistSync.mockReturnValue(true);
      });

      describe('when the dependency is missing', () => {
        beforeEach(() => {
          mockedRequire.mockImplementationOnce(() => null);
        });

        it.each([
          {
            packageSpec: 'potato',
            packageName: 'potato',
            itName:
              'should initialize the project and install the dependency when there is no version requirement',
          },
          {
            packageSpec: 'potato@1.2.3',
            packageName: 'potato',
            packageVersion: '1.2.3',
            itName:
              'should initialize the project and install the dependency when there is a version requirement',
          },
        ])('$itName', ({packageSpec, packageName, packageVersion}) => {
          mockedNpa.mockReturnValueOnce({
            name: packageName,
            saveSpec: packageVersion,
          } as unknown as Result);

          npf(packageSpec);

          expect(mockedSpawnSync).toHaveBeenNthCalledWith(
            1,
            'npm',
            ['install', '-E', packageSpec],
            {cwd: fakeLazyLoadedDepFolderPath}
          );
        });
      });

      describe('when the dependency is installed', () => {
        beforeEach(() => {
          mockedRequire.mockImplementationOnce(() => ({
            version: '1.0.0',
          }));
        });

        describe('when there is no version requirement', () => {
          beforeEach(() => {
            mockedNpa.mockReturnValue({
              name: 'potato',
            } as unknown as Result);
          });

          it('should forked the resolved entrypoint without install', () => {
            npf('potato');
            expect(mockedSpawnSync).not.toBeCalled();
            expect(mockedFork).toHaveBeenNthCalledWith(
              1,
              '/some/silly/path.js',
              [],
              undefined
            );
          });
        });

        describe('when there is a version requirement', () => {
          describe('when the version requirement is satisfied', () => {
            beforeEach(() => {
              mockedNpa.mockReturnValue({
                name: 'potato',
                saveSpec: '1.0.0',
              } as unknown as Result);
            });

            it('should fork using the resolved entrypoint', () => {
              npf('potato@1.0.0');
              expect(mockedSpawnSync).not.toBeCalled();
              expect(mockedFork).toHaveBeenNthCalledWith(
                1,
                '/some/silly/path.js',
                [],
                undefined
              );
            });
          });

          describe('when the version requirement is not satisfied', () => {
            beforeEach(() => {
              mockedNpa.mockReturnValue({
                name: 'potato',
                saveSpec: '1.2.3',
              } as unknown as Result);
            });

            it('should fork using the resolved entrypoint after install', () => {
              npf('potato@1.2.3');
              expect(mockedSpawnSync).toHaveBeenNthCalledWith(
                1,
                'npm',
                ['install', '-E', 'potato@1.2.3'],
                {cwd: fakeLazyLoadedDepFolderPath}
              );
              expect(mockedFork).toHaveBeenNthCalledWith(
                1,
                '/some/silly/path.js',
                [],
                undefined
              );
            });
          });
        });

        describe('when the dependency has no entrypoint', () => {
          beforeEach(() => {
            mockedRequireResolve.mockImplementationOnce(doThrowModuleNotFound);
          });

          it('should throw an InternalError', () => {
            try {
              npf('potato@1.2.3');
            } catch (error) {
              expect(error).toBeInstanceOf(InternalError);
              expect((error as InternalError).message).toMatchSnapshot();
            }
          });
        });
      });
    });
  });

  describe('when a packageName cannot be resolved by npa', () => {
    beforeEach(() => {
      mockedNpa.mockReturnValue({
        name: null,
        saveSpec: '1.2.3',
      } as unknown as Result);
    });

    it('should throw an InternalError', () => {
      try {
        npf('potato@1.2.3');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalError);
        expect((error as InternalError).message).toMatchSnapshot();
      }
    });
  });
});
