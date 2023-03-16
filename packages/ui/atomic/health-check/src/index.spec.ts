import {spawnSync} from 'node:child_process';
import {copyFileSync} from 'fs-extra';
import {mkdirSync, emptyDir} from 'fs-extra';
import {join} from 'node:path';
import {DirResult, dirSync} from 'tmp';

const execPath = join(__dirname, '..', 'dist');

const pathToStub = join(__dirname, '..', '__stub__');
const healthCheck = (cwd: string) => spawnSync('node', [execPath], {cwd});

const addPackageJsonToProject = (stubFile: string, dest: string) => {
  copyFileSync(join(pathToStub, stubFile), join(dest, 'package.json'));
};

const addReadmeToProject = (stubFile: string, dest: string) => {
  copyFileSync(join(pathToStub, stubFile), join(dest, 'readme.md'));
};

describe('@coveo/atomic-component-health-check', () => {
  let tempDirectory: DirResult;
  let testDirectory: string;

  beforeAll(async () => {
    tempDirectory = dirSync({unsafeCleanup: true, keep: true});
    testDirectory = join(tempDirectory.name, 'dummy-project');
    mkdirSync(testDirectory, {recursive: true});
  });

  beforeEach(() => {
    emptyDir(testDirectory);
  });

  afterAll(async () => {
    tempDirectory.removeCallback();
  });

  describe('when readme condition is not met', () => {
    beforeAll(() => {
      addPackageJsonToProject('validPackage.json', testDirectory);
    });

    it('should exit with status code 1', () => {
      const {status} = healthCheck(testDirectory);
      expect(status).toBe(1);
    });

    it('should warn about missing readme file', () => {
      const {stdout} = healthCheck(testDirectory);
      expect(stdout.toString()).toMatchSnapshot();
    });
  });

  describe('when package.json conditions are not met', () => {
    beforeEach(() => {
      addReadmeToProject('readme.md', testDirectory);
    });

    it('should exit with status code 1', () => {
      addPackageJsonToProject('missingProperties.json', testDirectory);
      const {status} = healthCheck(testDirectory);
      expect(status).toBe(1);
    });

    it.each([
      {
        title: 'should warn about missing properties',
        stubPackage: 'missingProperties.json',
      },
      {
        title: 'should warn about invalid properties',
        stubPackage: 'invalidProperties.json',
      },
    ])('$title', ({stubPackage}) => {
      addPackageJsonToProject(stubPackage, testDirectory);
      const {stdout} = healthCheck(testDirectory);
      expect(stdout.toString()).toMatchSnapshot();
    });
  });

  describe('when all conditions are met', () => {
    beforeEach(() => {
      addReadmeToProject('readme.md', testDirectory);
      addPackageJsonToProject('validPackage.json', testDirectory);
    });

    it('should print green checks only', () => {
      const {stdout} = healthCheck(testDirectory);
      expect(stdout.toString()).toMatchSnapshot();
    });
  });
});
