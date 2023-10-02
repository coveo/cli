import {ChildProcess} from 'node:child_process';
import {join} from 'node:path';
import {mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {npmSync} from '@coveo/do-npm';
import {startVerdaccio} from '@coveo/verdaccio-starter';
import {hashElement} from 'folder-hash';
import {DirResult, dirSync} from 'tmp';
import treeKill from 'tree-kill-promise';
import {SpawnSyncReturns} from 'child_process';

const PACKAGE_NAME = '@coveo/create-atomic-result-component';
// const UTILS_PACKAGE_NAME = '@coveo/create-atomic-commons';

describe(PACKAGE_NAME, () => {
  let verdaccioProcess: ChildProcess;
  let tempDirectory: DirResult;
  let testDirectory: string;
  let npmConfigCache: string;
  let verdaccioUrl: string;

  const assertAllAggregateErrorsFired = (
    tag: string,
    ...expectedErrorMessages: string[]
  ) => {
    const {stderr} = npmSync(
      ['init', PACKAGE_NAME.replace('/create-', '/'), '--', tag],
      {
        env: {
          ...process.env,
          npm_config_registry: verdaccioUrl,
          npm_config_cache: npmConfigCache,
        },
        cwd: testDirectory,
      }
    );

    expectedErrorMessages.forEach((expectedMessage) => {
      expect(stderr.toString()).toEqual(
        expect.stringContaining(expectedMessage)
      );
    });
  };

  beforeAll(async () => {
    ({verdaccioUrl, verdaccioProcess} = await startVerdaccio([
      PACKAGE_NAME,
      // UTILS_PACKAGE_NAME, // TODO: CDX-1428 include @coveo/create-atomic-commons
    ]));
    tempDirectory = dirSync({unsafeCleanup: true, keep: true});
    npmConfigCache = join(tempDirectory.name, 'npm-cache');
    mkdirSync(npmConfigCache);
  });

  afterAll(async () => {
    await treeKill(verdaccioProcess.pid);
    tempDirectory.removeCallback();
  });

  // TODO: CDX-1428: test ensureComponentValidity in a separate file
  describe('ensureComponentValidity', () => {
    beforeAll(() => {
      testDirectory = join(tempDirectory.name, 'cmp-validity');
      mkdirSync(testDirectory, {recursive: true});
    });

    const leadingSpaceTag = ' my-tag';
    const trailingSpaceTag = 'my-tag ';
    const surroundingSpacesTag = ' my-tag ';
    const upperCaseTag = 'My-Tag';
    const spaceTag = 'my- tag';
    const specialCharacterTags = ['你-好', 'my-@component', '!@#$!@#4-ohno'];
    const dashlessTag = 'dashless';
    const dashCrazyTag = 'dash--crazy';
    const trailingDashTag = 'dash-';
    const leadingDashTag = '-dash';
    const messedUpTag = '-My#--Component@-';

    it.each([
      leadingSpaceTag,
      trailingSpaceTag,
      surroundingSpacesTag,
      upperCaseTag,
      spaceTag,
      dashlessTag,
      dashCrazyTag,
      trailingDashTag,
      leadingDashTag,
      ...specialCharacterTags,
    ])('should throw an invalid tag name Aggregate error for "%s"', (str) => {
      expect(
        assertAllAggregateErrorsFired(
          str,
          'AggregateError: Invalid component tag name'
        )
      );
    });

    it.each([
      leadingSpaceTag,
      trailingSpaceTag,
      surroundingSpacesTag,
      upperCaseTag,
      spaceTag,
      ...specialCharacterTags,
    ])('should error on whitespace for "%s"', (str) => {
      assertAllAggregateErrorsFired(
        str,
        `"${str}" can only contain lower case alphabetical characters`
      );
    });

    it('should error if no dash', () => {
      assertAllAggregateErrorsFired(
        dashlessTag,
        '"dashless" must contain a dash (-) to work as a valid web component'
      );
    });

    it('should error on multiple dashes in a row', () => {
      assertAllAggregateErrorsFired(
        dashCrazyTag,
        '"dash--crazy" cannot contain multiple dashes (--) next to each other'
      );
    });

    it('should error on trailing dash', () => {
      assertAllAggregateErrorsFired(
        trailingDashTag,
        '"dash-" cannot end with a dash (-)'
      );
    });

    it('should error on leading dash', () => {
      assertAllAggregateErrorsFired(
        leadingDashTag,
        '"-dash" cannot start with a dash (-)'
      );
    });

    it('should error on multiple rules', () => {
      assertAllAggregateErrorsFired(
        messedUpTag,
        `"${messedUpTag}" can only contain lower case alphabetical characters`,
        `"${messedUpTag}" cannot contain multiple dashes (--) next to each other`,
        `"${messedUpTag}" cannot start with a dash (-)`,
        `"${messedUpTag}" cannot end with a dash (-)`
      );
    });
  });

  describe('ensureDirectoryValidity', () => {
    const assertAggregateErrorsNotFired = (
      tag: string,
      expectedErrorMessages: string
    ) => {
      const {stderr} = npmSync(
        ['init', PACKAGE_NAME.replace('/create-', '/'), '--', tag],
        {
          env: {
            ...process.env,
            npm_config_registry: verdaccioUrl,
            npm_config_cache: npmConfigCache,
          },
          cwd: testDirectory,
        }
      );

      expect(stderr.toString()).not.toEqual(
        expect.stringContaining(expectedErrorMessages)
      );
    };

    beforeEach(() => {
      testDirectory = join(tempDirectory.name, 'dir-validity');
      mkdirSync(testDirectory, {recursive: true});
    });

    afterEach(() => {
      rmSync(testDirectory, {recursive: true});
    });

    it('should not error when in empty directory', () => {
      assertAggregateErrorsNotFired(
        'component-name',
        'Invalid project directory'
      );
    });

    it('should not error when in non-empty directory with package.json', () => {
      writeFileSync(join(testDirectory, 'package.json'), '{}');
      assertAggregateErrorsNotFired(
        'component-name',
        'Invalid project directory'
      );
    });

    it('should error when in non-empty directory without package.json', () => {
      writeFileSync(
        join(testDirectory, '__init__.py'),
        "# Wait, this isn't a Headless project :O"
      );

      assertAllAggregateErrorsFired(
        'component-name',
        'Invalid project directory'
      );
    });
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
      mkdirSync(testDirectory, {recursive: true});
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
