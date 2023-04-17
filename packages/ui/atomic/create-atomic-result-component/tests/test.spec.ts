import {ChildProcess} from 'node:child_process';
import {join} from 'node:path';
import {mkdirSync} from 'node:fs';
import {npmSync} from '@coveo/do-npm';
import {startVerdaccio} from '@coveo/verdaccio-starter';
import {hashElement} from 'folder-hash';
import {DirResult, dirSync} from 'tmp';
import treeKill from 'tree-kill-promise';
import {SpawnSyncReturns} from 'child_process';

const PACKAGE_NAME = '@coveo/create-atomic-result-component';

describe(PACKAGE_NAME, () => {
  let verdaccioProcess: ChildProcess;
  let tempDirectory: DirResult;
  let testDirectory: string;
  let npmConfigCache: string;
  let verdaccioUrl: string;

  beforeAll(async () => {
    ({verdaccioUrl, verdaccioProcess} = await startVerdaccio(PACKAGE_NAME));
    tempDirectory = dirSync({unsafeCleanup: true, keep: true});
    npmConfigCache = join(tempDirectory.name, 'npm-cache');
    mkdirSync(npmConfigCache);
  });

  afterAll(async () => {
    await treeKill(verdaccioProcess.pid);
    tempDirectory.removeCallback();
  });

  describe.each([
    {
      describeName: 'when called without any args',
      args: [],
      testDirname: 'no-args',
      packageName: '@coveo/sample-result-component',
    },
    {
      describeName: 'when called in an existing project',
      args: ['oh-wow-another-component-can-you-believe-it'],
      testDirname: 'no-args',
      packageName: 'oh-wow-another-component-can-you-believe-it',
    },
    {
      describeName: 'when called with a valid component name',
      args: ['valid-component-name'],
      testDirname: 'valid-arg',
      packageName: 'valid-component-name',
    },
  ])('$describeName', ({args, testDirname, packageName}) => {
    beforeAll(() => {
      testDirectory = join(tempDirectory.name, testDirname);
      const mkdiroutput = mkdirSync(testDirectory, {recursive: true});
      process.stdout.write('*********************\n');
      process.stdout.write(`${mkdiroutput}\n`);
      process.stdout.write('*********************\n');
    });

    describe('when initializing', () => {
      let commandOutput: SpawnSyncReturns<string | Buffer>;

      beforeAll(() => {
        commandOutput = npmSync(
          ['init', PACKAGE_NAME.replace('/create-', '/'), ...args],
          {
            env: {
              ...process.env,
              npm_config_registry: verdaccioUrl,
              npm_config_cache: npmConfigCache,
            },
            cwd: testDirectory,
          }
        );

        process.stdout.write('********** commandOutput.stdout ***********\n');
        process.stdout.write(`${commandOutput.stdout}\n`);
        process.stdout.write('*********************\n');
        process.stdout.write('********** commandOutput.stderr ***********\n');
        process.stdout.write(`${commandOutput.stderr}\n`);
        process.stdout.write('*********************\n');
        process.stdout.write('********** commandOutput.status ***********\n');
        process.stdout.write(`${commandOutput.status}\n`);
        process.stdout.write('*********************\n');
      });

      it('should setup a base project and a component', async () => {
        expect(
          await hashElement(testDirectory, {
            folders: {
              exclude: ['**node_modules', 'dist'],
              ignoreRootName: true,
              ignoreBasename: true,
            },
            files: {
              include: ['*'],
              // stencil-docs.json contains dynamic timestamp value.
              // TODO: CDX-1393: E2E tests on health-check will test for stencil-docs.json file
              exclude: ['**package-lock.json', 'stencil-docs.json'],
              ignoreRootName: true,
              ignoreBasename: true,
            },
          })
        ).toMatchSnapshot();
      });

      it('should ouptut a confirmation message upon success', () => {
        expect(commandOutput.stdout.toString()).toMatchSnapshot();
      });

      it('should be able to install all deps without issues', () => {
        const output: SpawnSyncReturns<string | Buffer> = npmSync(['install'], {
          cwd: testDirectory,
          env: {
            ...process.env,
            npm_config_registry: verdaccioUrl,
            npm_config_cache: npmConfigCache,
          },
        }).status;
        process.stdout.write('********** commandOutput.stdout ***********\n');
        process.stdout.write(`${output.stdout}\n`);
        process.stdout.write('*********************\n');
        process.stdout.write('********** commandOutput.stderr ***********\n');
        process.stdout.write(`${output.stderr}\n`);
        process.stdout.write('*********************\n');
        process.stdout.write('********** commandOutput.status ***********\n');
        process.stdout.write(`${output.status}\n`);
        process.stdout.write('*********************\n');
        expect(output).toBe(0);
      });

      it('should be able to build without issues', () => {
        expect(
          npmSync(['run', 'build', '-w', packageName], {
            cwd: testDirectory,
          }).status
        ).toBe(0);
      });
    });
  });
});
