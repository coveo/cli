import stripAnsi from 'strip-ansi';
import {ChildProcess} from 'node:child_process';
import {join} from 'node:path';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {npmSync} from '@coveo/do-npm';
import {startVerdaccio} from '@coveo/verdaccio-starter';
import {hashElement} from 'folder-hash';
import {DirResult, dirSync} from 'tmp';
import treeKill from 'tree-kill';

const getJsonPackagePath = (packageName: string, testDir: string) =>
  join(
    testDir,
    'src',
    'components',
    packageName.replace(/@coveo\//, ''),
    'package.json'
  );

const getComponentJsonPackage = (jsonPackagePath: string) => {
  const json = readFileSync(jsonPackagePath).toString();
  return JSON.parse(json);
};

const overwriteJsonPackage = (jsonPackagePath: string, json: {}) => {
  writeFileSync(jsonPackagePath, JSON.stringify(json, null, 2));
};

/**
 * Add required properties so health check assertions are met
 */
const addMissingPropertiesToJsonPackage = (json: {}) => {
  return {
    ...json,
    description:
      'Custom Atomic component for E2E testing: This is component should pass all Health checks',
    homepage: 'https://my-custom-atomic-component-source-code.com',
  };
};

const publish = (pkgName: string, cwd: string) => {
  return npmSync(['publish', '--dry-run', '-w', pkgName], {
    cwd,
    stdio: 'inherit',
  });
};

const ATOMIC_PROJECT_NAMES = [
  '@coveo/create-atomic-component',
  '@coveo/create-atomic-result-component',
];
const PACKAGE_NAME_HEALTH = '@coveo/atomic-component-health-check';

describe(PACKAGE_NAME_HEALTH, () => {
  let verdaccioProcess: ChildProcess;
  let tempDirectory: DirResult;
  let testDirectory: string;
  let npmCache: string;
  let verdaccioUrl: string;

  beforeAll(async () => {
    ({verdaccioUrl, verdaccioProcess} = await startVerdaccio([
      PACKAGE_NAME_HEALTH,
      ...ATOMIC_PROJECT_NAMES,
    ]));
    tempDirectory = dirSync({unsafeCleanup: true, keep: true});
    npmCache = join(tempDirectory.name, 'npm-cache');
    mkdirSync(npmCache);
  });

  afterAll(async () => {
    verdaccioProcess.pid && (await treeKill(verdaccioProcess.pid));
    console.log(tempDirectory.name);
    tempDirectory.removeCallback();
  });

  describe.each(ATOMIC_PROJECT_NAMES)('%s', (atomicProjectName) => {
    const args = ['valid-component-name'];
    const pkgName = 'valid-component-name';

    beforeAll(() => {
      testDirectory = join(tempDirectory.name, atomicProjectName);
      mkdirSync(testDirectory, {recursive: true});
    });

    it('should initialize a base project and a component', async () => {
      npmSync(['init', atomicProjectName.replace('/create-', '/'), ...args], {
        env: {
          ...process.env,
          npm_config_registry: verdaccioUrl,
          npm_config_cache: npmCache,
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
          stdio: 'inherit',
          env: {
            ...process.env,
            npm_config_registry: verdaccioUrl,
            npm_config_cache: npmCache,
          },
        }).status
      ).toBe(0);
    });

    it('should be able to build without issues', () => {
      expect(
        npmSync(['run', 'build', '-w', pkgName], {
          cwd: testDirectory,
          stdio: 'inherit',
        }).status
      ).toBe(0);
    });

    describe('health-check', () => {
      beforeAll(() => {
        const jsonPackagePath = getJsonPackagePath(pkgName, testDirectory);
        const initialJson = getComponentJsonPackage(jsonPackagePath);
        const updatedJson = addMissingPropertiesToJsonPackage(initialJson);
        overwriteJsonPackage(jsonPackagePath, updatedJson);
      });

      // TODO: decomment once tested are done with windows
      // it('should be able to pass health checks', () => {
      //   const {stdout} = publish(pkgName, testDirectory);
      //   const message = stripAnsi(stdout.toString()).replace(/\n/g, '');
      //   expect(message).not.toContain('✖');
      //   expect(message).toContain('✔ Readme file');
      //   expect(message).toContain('✔ Component name');
      //   expect(message).toContain('✔ Required properties in package.json');
      // });

      it('should be able to publish without issues', () => {
        expect(publish(pkgName, testDirectory).status).toBe(0);
      });
    });
  });
});
