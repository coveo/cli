import {join} from 'path';
import {CLI_EXEC_PATH, getConfig, getPathToHomedirEnvFile} from '../utils/cli';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';
import {config} from 'dotenv';
import {listExtensions, listFields} from '../utils/platform';
config({path: getPathToHomedirEnvFile()});

describe('org:config', () => {
  const testOrgId = process.env.TEST_ORG_ID!;
  const {accessToken} = getConfig();
  let processManager: ProcessManager;

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
        cwd: join('snapshot-project'), // TODO: put in util
      },
      procManager,
      'org-config-push'
    );

    await pushTerminal.when('exit').on('process').do().once();
  };

  const pullFromOrg = async (
    targetOrg: string,
    procManager: ProcessManager
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
        cwd: join('new-snapshot-project'), // TODO: put in util!!!!!!!
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
    it.todo('should preview before pushing');
  });

  describe('org:config:push', () => {
    beforeAll(async () => {
      await pushToOrg(testOrgId, processManager);
    });

    it(
      'should have pushed fields',
      async () => {
        const fields: unknown[] = await listFields(testOrgId, accessToken);
        expect(fields.map.name).toContain(['firstfield', 'whereisbrian']);
      },
      2 * 60e3
    );

    it(
      'should have pushed extensions',
      async () => {
        const extensions: unknown[] = await listExtensions(
          testOrgId,
          accessToken
        );
        expect(extensions.map.name).toContain(['palpatine']);
      },
      2 * 60e3
    );
  });

  it.skip("should pull the org's content", async () => {
    await pullFromOrg(testOrgId, processManager);
    // TODO: check files under resources
    // TODO: snapshot-project/resources & and new-snapshot-project/resources new folder should have the same files
  });
});
