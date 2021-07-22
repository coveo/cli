import {join} from 'path';
import {CLI_EXEC_PATH, getConfig, getPathToHomedirEnvFile} from '../utils/cli';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';
import {config} from 'dotenv';
import {listExtensions, listFields} from '../utils/platform';
import {ensureDirSync, existsSync} from 'fs-extra';
config({path: getPathToHomedirEnvFile()});

describe('org:config', () => {
  const testOrgId = process.env.TEST_ORG_ID!;
  const {accessToken} = getConfig();
  const snapshotProjectPath = join('snapshot-project');
  const defaultTimeout = 10 * 60e3;
  let processManager: ProcessManager;

  const previewChange = (targetOrg: string, procManager: ProcessManager) => {
    const args: string[] = [
      CLI_EXEC_PATH,
      'org:config:preview',
      `-t=${targetOrg}`,
    ];
    if (process.platform === 'win32') {
      args.unshift('node');
    }
    const previewTerminal = new Terminal(
      args.shift()!,
      args,
      {
        cwd: snapshotProjectPath,
      },
      procManager,
      'org-config-preview'
    );

    // previewTerminal.when('exit').on('process').do().once();
    return previewTerminal;
  };

  const pushToOrg = async (targetOrg: string, procManager: ProcessManager) => {
    const args: string[] = [
      CLI_EXEC_PATH,
      'org:config:push',
      '--skipPreview',
      `-t=${targetOrg}`,
    ];
    if (process.platform === 'win32') {
      args.unshift('node');
    }
    const pushTerminal = new Terminal(
      args.shift()!,
      args,
      {
        cwd: snapshotProjectPath,
      },
      procManager,
      'org-config-push'
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
      'org:config:pull',
      `-t=${targetOrg}`,
    ];
    if (process.platform === 'win32') {
      args.unshift('node');
    }
    const pushTerminal = new Terminal(
      args.shift()!,
      args,
      {
        cwd: destinationPath,
      },
      procManager,
      'org-config-pull'
    );

    await pushTerminal.when('exit').on('process').do().once();
  };

  beforeAll(async () => {
    processManager = new ProcessManager();
  });

  afterAll(async () => {
    await processManager.killAllProcesses();
  });

  describe('org:config:preview', () => {
    it(
      'should preview the snapshot',
      async (done) => {
        const previewTerminal = previewChange(testOrgId, processManager);
        const stringMatch = `Extensions
      +   1 to create

         Fields
      +   66 to create

         Filters
      +   1 to create`;
        const regex = new RegExp(stringMatch, 'm');
        await previewTerminal.when(regex).on('stdout').do(done).once();
      },
      defaultTimeout
    );
  });

  describe('org:config:push', () => {
    beforeAll(async () => {
      await pushToOrg(testOrgId, processManager);
    }, defaultTimeout);

    it('should have pushed fields', async () => {
      const fields: unknown[] = (await listFields(testOrgId, accessToken))
        .items;
      expect(fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({name: 'firstfield'}),
          expect.objectContaining({name: 'whereisbrian'}),
        ])
      );
    });

    it('should have pushed extensions', async () => {
      const extensions: unknown[] = await listExtensions(
        testOrgId,
        accessToken
      );
      expect(extensions).toEqual(
        expect.arrayContaining([expect.objectContaining({name: 'palpatine'})])
      );
    });
  });

  describe('org:config:pull', () => {
    const destinationPath = join('new-snapshot-project');

    beforeAll(() => {
      ensureDirSync(destinationPath);
    });

    it(
      "should pull the org's content",
      async () => {
        await pullFromOrg(testOrgId, processManager, destinationPath);
        // TODO: better checks
        expect(existsSync(destinationPath));
      },
      defaultTimeout
    );
  });
});
