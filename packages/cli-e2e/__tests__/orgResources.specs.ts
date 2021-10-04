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
      dateFormat: '',
      includeInQuery: true,
      hierarchicalFacet: false,
      mergeWithLexicon: false,
      description: '',
      useCacheForComputedFacet: false,
      sort: false,
      type: FieldTypes.STRING,
      smartDateFacet: false,
      multiValueFacet: false,
      multiValueFacetTokenizers: ';',
      useCacheForNestedQuery: false,
      name: 'firstfield',
      stemming: false,
      includeInResults: true,
      ranking: false,
      useCacheForSort: false,
      facet: false,
      useCacheForNumericQuery: false,
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
          ].join('\\s*');
          const regex = new RegExp(expectedOutput, 'gm');

          await previewTerminal.when(regex).on('stdout').do().once();
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
          const previewTerminal = previewChange(
            testOrgId,
            processManager,
            'org-config-preview-unsync'
          );
          const warningRegex = new RegExp(
            /Warning: Unsynchronized resource detected/
          );

          await previewTerminal.when(warningRegex).on('stderr').do().once();
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
          expect.objectContaining({name: 'dummyfield'}),
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
});
