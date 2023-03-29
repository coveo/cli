import {ChildProcess} from 'node:child_process';
import {join} from 'node:path';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {npmSync} from '@coveo/do-npm';
import {startVerdaccio} from '@coveo/verdaccio-starter';
import {hashElement} from 'folder-hash';
import {DirResult, dirSync} from 'tmp';
import treeKill from 'tree-kill-promise';

const PACKAGE_NAME = '@coveo/create-atomic-result-component';
const PACKAGE_NAME_HEALTH = '@coveo/atomic-component-health-check';

describe(PACKAGE_NAME, () => {
  let verdaccioProcess: ChildProcess;
  let tempDirectory: DirResult;
  let testDirectory: string;
  let npmConfigCache: string;
  let verdaccioUrl: string;

  beforeAll(async () => {
    ({verdaccioUrl, verdaccioProcess} = await startVerdaccio([
      PACKAGE_NAME,
      PACKAGE_NAME_HEALTH,
    ]));
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

    describe('health-check', () => {
      beforeAll(() => {
        const pkgJsonPath = join(
          testDirectory,
          'src',
          'components',
          packageName.replace(/@coveo\//, ''),
          'package.json'
        );

        const json = readFileSync(pkgJsonPath).toString();
        const updatedJson = {
          ...JSON.parse(json),
          description:
            'Custom Atomic component for E2E testing: This is component should should pass all Health checks',
          homepage: 'https://my-custom-atomic-component-source-code.com',
        };
        writeFileSync(pkgJsonPath, JSON.stringify(updatedJson, null, 2));
      });

      it('should be able to pass health checks', () => {
        const message = npmSync(['publish', '--dry-run', '-w', packageName], {
          cwd: testDirectory,
        }).stdout.toString();
        expect(message).not.toContain('✖');
        expect(message).toContain('✔ Readme file');
        expect(message).toContain('✔ Component name');
        expect(message).toContain('✔ Required properties in package.json');
      });

      it('should be able to publish without issues', () => {
        expect(
          npmSync(['publish', '--dry-run', '-w', packageName], {
            cwd: testDirectory,
          }).status
        ).toBe(0);
      });
    });
  });
});
