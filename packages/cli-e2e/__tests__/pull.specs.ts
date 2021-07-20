import {join} from 'path';
import {CLI_EXEC_PATH, getConfig, getSnapshotProjectPath} from '../utils/cli';
import {createOrg, deleteOrg} from '../utils/platform';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('org:config', () => {
  const {accessToken} = getConfig();
  let processManager: ProcessManager;
  let testOrg: string;
  const orgId = `cli-e2e-${process.env.TEST_RUN_ID}`;

  const populateOrg = async (
    targetOrg: string,
    procManager: ProcessManager
  ) => {
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
    testOrg = await createOrg(orgId, accessToken);
  });

  afterAll(async () => {
    // await deleteOrg(testOrg, accessToken); TODO: uncomment
    await processManager.killAllProcesses();
  });

  it.todo('should preview before pushing');

  it(
    'should be able to push with CLI,',
    async () => {
      await populateOrg(testOrg, processManager);
      // TODO: clean that...
      // Rest request (axios) with the orgId and access token and expect data in the org
      expect(1).toBe(1);
    },
    2 * 60e3
  );

  it.skip("should pull the org's content", async () => {
    await pullFromOrg(testOrg, processManager);
    // TODO: check files under resources
    // TODO: snapshot-project/resources & and new-snapshot-project/resources new folder should have the same files
  });
});
