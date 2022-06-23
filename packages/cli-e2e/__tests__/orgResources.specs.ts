import {join} from 'path';
import {
  answerPrompt,
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
import PlatformClient from '@coveord/platform-client';
import {getPlatformClient} from '../utils/platform';
import {getTestOrg} from '../utils/testOrgSetup';
import {readdirSync} from 'fs';
import {cwd} from 'process';
import {EOL} from 'os';
config({path: getEnvFilePath()});

describe('org:resources', () => {
  let testOrgId = '';
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
    return new Terminal('node', args, {cwd}, procManager, debugName);
  };

  const previewChange = (
    targetOrg: string,
    procManager: ProcessManager,
    debugName = 'org-config-preview'
  ) => {
    const args: string[] = [
      process.env.CLI_EXEC_PATH!,
      'org:resources:preview',
      `-o=${targetOrg}`,
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
      process.env.CLI_EXEC_PATH!,
      'org:resources:push',
      '--skipPreview',
      `-o=${targetOrg}`,
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
      process.env.CLI_EXEC_PATH!,
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
    testOrgId = await getTestOrg();
    copySync('snapshot-project', snapshotProjectPath);
    platformClient = getPlatformClient(testOrgId, accessToken);
    processManager = new ProcessManager();
  }, 5 * 60e3);

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
          ['-o', testOrgId],
          'org-resources-pull-all'
        );
        const snapshotFiles = readdirSync(snapshotProjectPath);
        const destinationFiles = readdirSync(destinationPath);

        expect(snapshotFiles).toEqual(destinationFiles);
      },
      defaultTimeout
    );

    it(
      'directory should only contain pulled resources and manifest',
      async () => {
        await pullFromOrg(
          processManager,
          destinationPath,
          ['-o', testOrgId, '-r', 'FIELD'],
          'org-resources-pull-all-fields'
        );
        const originalResources = getResourceFolderContent(snapshotProjectPath);
        const destinationResources = getResourceFolderContent(destinationPath);

        expect(destinationResources.length).toBeGreaterThan(0);
        expect(destinationResources.length).toBeLessThan(
          originalResources.length + 1
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
