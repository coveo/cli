import {CLI_EXEC_PATH, getConfig} from '../utils/cli';
import {createOrg, deleteOrg} from '../utils/platform';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('org:config:pull', () => {
  const {organization, accessToken} = getConfig();
  let processManager: ProcessManager;
  let testOrg: string;

  const switchOrg = (orgId: string, procManager: ProcessManager) => {
    const args: string[] = [CLI_EXEC_PATH, 'config:set', `-o=${orgId}`];
    if (process.platform === 'win32') {
      args.unshift('node');
    }
    const switchTerminal = new Terminal(
      args.shift()!,
      args,
      undefined,
      procManager,
      'config-set'
    );

    return switchTerminal.when('exit').on('process').do().once();
  };

  const populateOrg = (targetOrg: string, procManager: ProcessManager) => {
    const args: string[] = [
      CLI_EXEC_PATH,
      'org:config:push',
      `-t=${targetOrg}`,
    ];
    if (process.platform === 'win32') {
      args.unshift('node');
    }
    const pushTerminal = new Terminal(
      args.shift()!,
      args,
      undefined,
      procManager,
      'org:config:push'
    );

    return pushTerminal.when('exit').on('process').do().once();
  };

  beforeAll(async () => {
    processManager = new ProcessManager();
    testOrg = await createOrg('cli-test-org', accessToken);
    await switchOrg(testOrg, processManager);
  });

  afterAll(async () => {
    // await deleteOrg(testOrg, accessToken); TODO: uncomment
    await switchOrg(organization, processManager);
    await processManager.killAllProcesses();
  });

  it('should be able to push with CLI,', async () => {
    await populateOrg(testOrg, processManager);
    // TODO: clean that...
    expect(1).toBe(1);
  });
});
