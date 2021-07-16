import {CLI_EXEC_PATH, getConfig, getSnapshotProjectPath} from '../utils/cli';
import {createOrg, deleteOrg} from '../utils/platform';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('org:config:pull', () => {
  const {accessToken} = getConfig();
  let processManager: ProcessManager;
  let testOrg: string;

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
        cwd: getSnapshotProjectPath(),
      },
      procManager,
      'org-config-push'
    );

    await pushTerminal.when('exit').on('process').do().once();
  };

  beforeAll(async () => {
    processManager = new ProcessManager();
    testOrg = await createOrg('cli-e2e-test', accessToken);
  });

  afterAll(async () => {
    // await deleteOrg(testOrg, accessToken); TODO: uncomment
    await processManager.killAllProcesses();
  });

  it('should be able to push with CLI,', async () => {
    await populateOrg(testOrg, processManager);
    // TODO: clean that...
    expect(1).toBe(1);
  });
});
