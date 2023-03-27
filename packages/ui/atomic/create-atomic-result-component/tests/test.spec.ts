import {ChildProcess} from 'node:child_process';
import {join} from 'node:path';
import {mkdirSync} from 'node:fs';
import {npmSync} from '@coveo/do-npm';
import {startVerdaccio} from '@coveo/verdaccio-starter';
import {hashElement} from 'folder-hash';
import {DirResult, dirSync} from 'tmp';
import treeKill from 'tree-kill-promise';

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
    {
      describeName: 'when called with a component name without hyphen',
      args: ['nohypen'],
      testDirname: 'invalid-arg',
      packageName: 'atomic-nohypen',
    },
  ])('$describeName', ({args, testDirname, packageName}) => {
    beforeAll(() => {
      testDirectory = join(tempDirectory.name, testDirname);
      mkdirSync(testDirectory, {recursive: true});
    });

    it('should initialize a base project and a component', async () => {
      npmSync(['init', PACKAGE_NAME.replace('/create-', '/'), ...args], {
        env: {
          ...process.env,
          npm_config_registry: verdaccioUrl,
          npm_config_cache: npmConfigCache,
        },
        cwd: testDirectory,
      });

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

    it('should be able to install all deps without issues', () => {
      expect(
        npmSync(['install'], {
          cwd: testDirectory,
          env: {
            ...process.env,
            npm_config_registry: verdaccioUrl,
            npm_config_cache: npmConfigCache,
          },
        }).status
      ).toBe(0);
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
