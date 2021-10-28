import {join} from 'path';
import {CLI_EXEC_PATH, getConfig, getPathToHomedirEnvFile} from '../utils/cli';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';
import {config} from 'dotenv';
import {ensureDirSync} from 'fs-extra';
import PlatformClient, {FieldTypes} from '@coveord/platform-client';
import {getPlatformClient} from '../utils/platform';
import {readdirSync} from 'fs';
config({path: getPathToHomedirEnvFile()});

describe('org:resources', () => {
  const testOrgId = process.env.TEST_ORG_ID!;
  const {accessToken} = getConfig();
  const snapshotProjectPath = join('snapshot-project');
  const defaultTimeout = 10 * 60e3;
  let processManager: ProcessManager;
  let platformClient: PlatformClient;

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

  const pullFromOrg = async (
    targetOrg: string,
    procManager: ProcessManager,
    destinationPath: string
  ) => {
    const args: string[] = [
      CLI_EXEC_PATH,
      'org:resources:pull',
      `-t=${targetOrg}`,
      '--no-git',
    ];

    const pullTerminal = createNewTerminal(
      args,
      procManager,
      destinationPath,
      'org-config-pull'
    );

    await pullTerminal.when('exit').on('process').do().once();
  };

  beforeAll(async () => {
    platformClient = getPlatformClient(testOrgId, accessToken);
    processManager = new ProcessManager();
  });

  afterAll(async () => {
    await processManager.killAllProcesses();
  });

  describe('org:resources:preview', () => {
    describe('when resources are synchronized', () => {
      it(
        'should preview the snapshot',
        async () => {
          let returnedPreview = false;
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
            'Filters',
            '\\+   1 to create',
            'Ml models',
            '\\+   1 to create',
            'Query parameters',
            '\\+   1 to create',
            'Query pipelines',
            '\\+   1 to create',
            'Query pipeline conditions',
            '\\+   2 to create',
            'Ranking weights',
            '\\+   1 to create',
            'Triggers',
            '\\+   1 to create',
          ].join('\\s*');
          const regex = new RegExp(expectedOutput, 'gm');

          const previewTerminalExitPromise = previewTerminal
            .when('exit')
            .on('process')
            .do()
            .once();

          previewTerminal
            .when(regex)
            .on('stdout')
            .do(() => {
              returnedPreview = true;
            })
            .until(previewTerminalExitPromise);

          await previewTerminalExitPromise;
          expect(returnedPreview).toBe(true);
        },
        defaultTimeout
      );
    });

    describe('when resources are not synchronized', () => {
      beforeAll(async () => {
        await createFieldWithoutUsingSnapshot(platformClient);
      });

      it(
        'should throw a synchronization warning on a field',
        async () => {
          let returnedSynchronizationWarning = false;
          let returnedPreview = false;

          const previewTerminal = previewChange(
            testOrgId,
            processManager,
            'org-config-preview-unsync'
          );

          const previewTerminalExitPromise = previewTerminal
            .when('exit')
            .on('process')
            .do()
            .once();

          previewTerminal
            .when(/Checking for automatic synchronization/)
            .on('stderr')
            .do(() => {
              returnedSynchronizationWarning = true;
            })
            .until(previewTerminalExitPromise);

          previewTerminal
            .when(/Previewing resource changes/)
            .on('stdout')
            .do(() => {
              returnedPreview = true;
            })
            .until(previewTerminalExitPromise);

          await previewTerminalExitPromise;
          expect(returnedSynchronizationWarning).toBe(true);
          expect(returnedPreview).toBe(true);
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
    const destinationPath = join('new-snapshot-project');

    beforeAll(() => {
      ensureDirSync(destinationPath);
    });

    it(
      "should pull the org's content",
      async () => {
        await pullFromOrg(testOrgId, processManager, destinationPath);

        const snapshotFiles = readdirSync(snapshotProjectPath);
        const destinationFiles = readdirSync(destinationPath);

        expect(snapshotFiles).toEqual(destinationFiles);
      },
      defaultTimeout
    );
  });

  it('should not have any snapshot in the target org', async () => {
    const snapshotlist = await platformClient.resourceSnapshot.list();
    expect(snapshotlist).toHaveLength(0);
  });
});
