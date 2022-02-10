import {join} from 'path';
import {
  answerPrompt,
  CLI_EXEC_PATH,
  getConfig,
  getEnvFilePath,
  getProjectPath,
  isGenericYesNoPrompt,
  getUIProjectPath,
} from '../utils/cli';
import {fileSync} from 'tmp';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';
import {config} from 'dotenv';
import {
  ensureDirSync,
  readJsonSync,
  rmSync,
  writeJsonSync,
  copySync,
} from 'fs-extra';
import PlatformClient, {FieldTypes} from '@coveord/platform-client';
import {getPlatformClient} from '../utils/platform';
import {readdirSync} from 'fs';
import {cwd} from 'process';
import {EOL} from 'os';
config({path: getEnvFilePath()});

describe('org:resources', () => {
  const testOrgId = process.env.TEST_ORG_ID!;
  const {accessToken} = getConfig();
  const snapshotProjectPath = join(getUIProjectPath(), 'snapshot-project');
  const defaultTimeout = 10 * 60e3;
  let processManager: ProcessManager;
  let platformClient: PlatformClient;
  const pathToStub = join(cwd(), '__stub__');

  const createNewTerminal = (
    args: string[],
    procManager: ProcessManager,
    cwd: string,
    debugName: string
  ) => {
    if (process.platform === 'win32') {
      args.unshift('node');
    }
    return new Terminal(args.shift()!, args, {cwd}, procManager, debugName);
  };

  const createFieldWithoutUsingSnapshot = async (client: PlatformClient) => {
    await client.field.create({
      description: '',
      facet: false,
      includeInQuery: true,
      includeInResults: true,
      mergeWithLexicon: false,
      multiValueFacet: false,
      multiValueFacetTokenizers: ';',
      name: 'firstfield',
      ranking: false,
      sort: false,
      stemming: false,
      system: false,
      type: FieldTypes.STRING,
      useCacheForComputedFacet: false,
      useCacheForNestedQuery: false,
      useCacheForNumericQuery: false,
      useCacheForSort: false,
    });
  };

  const previewChange = (
    targetOrg: string,
    procManager: ProcessManager,
    debugName = 'org-config-preview'
  ) => {
    const args: string[] = [
      CLI_EXEC_PATH,
      'org:resources:preview',
      `-t=${targetOrg}`,
      '--sync',
      '--wait=0',
      '-p=light',
    ];

    return createNewTerminal(args, procManager, snapshotProjectPath, debugName);
  };

  const pushToOrg = async (
    targetOrg: string,
    procManager: ProcessManager,
    debugName = 'org-config-push'
  ) => {
    const args: string[] = [
      CLI_EXEC_PATH,
      'org:resources:push',
      '--skipPreview',
      `-t=${targetOrg}`,
      '--wait=0',
    ];
    const pushTerminal = createNewTerminal(
      args,
      procManager,
      snapshotProjectPath,
      debugName
    );

    await pushTerminal.when('exit').on('process').do().once();
  };

  const addOrgIdToModel = (
    fromModelPath: string,
    destinationModelPath: string,
    orgId: string
  ) => {
    const model = readJsonSync(fromModelPath);
    writeJsonSync(destinationModelPath, {...model, orgId});
  };

  const pullFromOrg = async (
    procManager: ProcessManager,
    destinationPath: string,
    additionalFlags: string[] = [],
    debugName: string
  ) => {
    const args: string[] = [
      CLI_EXEC_PATH,
      'org:resources:pull',
      '-o',
      '--wait=0',
      '--no-git',
      ...additionalFlags,
    ];

    const pullTerminal = createNewTerminal(
      args,
      procManager,
      destinationPath,
      debugName
    );

    const pullTerminalExitPromise = pullTerminal
      // TODO: CDX-744: understand why cannot use process.on('exit')
      .when(/Project updated/)
      .on('stderr')
      .do()
      .once();

    await pullTerminal
      .when(isGenericYesNoPrompt)
      .on('stderr')
      .do(answerPrompt(`y${EOL}`))
      .until(pullTerminalExitPromise);
  };

  beforeAll(async () => {
    copySync('snapshot-project', snapshotProjectPath);
    platformClient = getPlatformClient(testOrgId, accessToken);
    processManager = new ProcessManager();
  });

  afterAll(async () => {
    await processManager.killAllProcesses();
  });

  describe('org:resources:preview', () => {
    describe('when resources are synchronized', () => {
      let stdout = '';
      const stdoutListener = (chunk: string) => {
        stdout += chunk;
      };

      it(
        'should preview the snapshot',
        async () => {
          const previewTerminal = previewChange(
            testOrgId,
            processManager,
            'org-config-preview-sync'
          );

          const expectedOutput = [
            'Extensions',
            '\\+   1 to create',
            'Fields',
            '\\+   2 to create',
          ].join('\\s*');
          const regex = new RegExp(expectedOutput, 'gm');

          previewTerminal.orchestrator.process.stdout.on(
            'data',
            stdoutListener
          );

          const previewTerminalExitPromise = previewTerminal
            .when('exit')
            .on('process')
            .do((proc) => {
              proc.stdout.off('data', stdoutListener);
            })
            .once();

          await previewTerminalExitPromise;
          expect(stdout).toMatch(regex);
        },
        defaultTimeout
      );
    });

    // TODO CDX-753: Create new unsynchronized state for E2E tests.
    describe.skip('when resources are not synchronized', () => {
      let stdout: string;
      let stderr: string;

      const stdoutListener = (chunk: string) => {
        stdout += chunk;
      };
      const stderrListener = (chunk: string) => {
        stderr += chunk;
      };

      beforeAll(async () => {
        stdout = stderr = '';
        await createFieldWithoutUsingSnapshot(platformClient);
      });

      it(
        'should throw a synchronization warning on a field',
        async () => {
          const previewTerminal = previewChange(
            testOrgId,
            processManager,
            'org-config-preview-unsync'
          );

          const process = previewTerminal.orchestrator.process;
          process.stdout.on('data', stdoutListener);
          process.stderr.on('data', stderrListener);

          const previewTerminalExitPromise = previewTerminal
            .when('exit')
            .on('process')
            .do((proc) => {
              proc.stdout.off('data', stdoutListener);
              proc.stderr.off('data', stderrListener);
            })
            .once();

          await previewTerminalExitPromise;
          expect(stdout).toMatch(/Previewing resource changes/);
          expect(stderr).toMatch(/Checking for automatic synchronization/);
        },
        defaultTimeout
      );
    });
  });

  describe('org:resources:push', () => {
    beforeAll(async () => {
      await pushToOrg(testOrgId, processManager);
    }, defaultTimeout);

    it('should have pushed fields', async () => {
      const fields = (await platformClient.field.list()).items;
      expect(fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({name: 'firstfield'}),
          expect.objectContaining({name: 'whereisbrian'}),
        ])
      );
    });

    it('should have pushed extensions', async () => {
      const extensions = await platformClient.extension.list();
      expect(extensions).toEqual(
        expect.arrayContaining([expect.objectContaining({name: 'palpatine'})])
      );
    });
  });

  describe('org:resources:pull', () => {
    const destinationPath = getProjectPath('new-snapshot-project');
    const getResourceFolderContent = (projectPath: string) =>
      readdirSync(join(projectPath, 'resources'));

    beforeEach(() => {
      rmSync(destinationPath, {recursive: true, force: true});
      ensureDirSync(destinationPath);
    });

    it(
      "should pull the org's content",
      async () => {
        await pullFromOrg(
          processManager,
          destinationPath,
          ['-t', testOrgId],
          'org-resources-pull-all'
        );
        const snapshotFiles = readdirSync(snapshotProjectPath);
        const destinationFiles = readdirSync(destinationPath);

        expect(snapshotFiles).toEqual(destinationFiles);
      },
      defaultTimeout
    );

    it(
      'directory should only contain pulled resources',
      async () => {
        await pullFromOrg(
          processManager,
          destinationPath,
          ['-t', testOrgId, '-r', 'FIELD'],
          'org-resources-pull-all-fields'
        );
        const originalResources = getResourceFolderContent(snapshotProjectPath);
        const destinationResources = getResourceFolderContent(destinationPath);

        expect(destinationResources.length).toBeGreaterThan(0);
        expect(destinationResources.length).toBeLessThan(
          originalResources.length
        );
      },
      defaultTimeout
    );

    it(
      'snapshot should only contain one single field',
      async () => {
        const fixtureModelPath = join(
          pathToStub,
          'snapshotPullModel',
          'oneFieldOnly.json'
        );
        const tmpModel = fileSync({postfix: '.json'});
        addOrgIdToModel(fixtureModelPath, tmpModel.name, testOrgId);
        await pullFromOrg(
          processManager,
          destinationPath,
          ['-m', tmpModel.name],
          'org-resources-pull-one-field'
        );
        const fields = readJsonSync(
          join(destinationPath, 'resources', 'FIELD.json')
        );

        expect(fields.resources.FIELD.length).toBe(1);
      },
      defaultTimeout
    );
  });

  it('should not have any snapshot in the target org', async () => {
    const snapshotlist = await platformClient.resourceSnapshot.list();
    expect(snapshotlist).toHaveLength(0);
  });
});
