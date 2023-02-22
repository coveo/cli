import {join} from 'path';
import PlatformClient from '@coveo/platform-client';
import {getPlatformClient} from '../utils/platform';
import {getTestOrg} from '../utils/testOrgSetup';
import {ProcessManager} from '../utils/processManager';
import {getConfig, getUIProjectPath} from '../utils/cli';
import {copySync} from 'fs-extra';
import {Terminal} from '../utils/terminal/terminal';

describe('ui:deploy', () => {
  let platformClient: PlatformClient;
  let testOrgId = '';
  const deployProject = 'deploy-project';
  const {accessToken} = getConfig();
  const deployProjectPath = join(getUIProjectPath(), deployProject);
  let processManager: ProcessManager;
  const defaultTimeout = 5 * 60e3;
  let stdout: string;
  const stdoutListener = (chunk: string) => {
    stdout += chunk;
  };

  const createNewTerminal = async () => {
    const args: string[] = [
      process.env.CLI_EXEC_PATH!,
      'ui:deploy',
      `-o=${testOrgId}`,
    ];
    const terminal = new Terminal(
      'node',
      args,
      {cwd: deployProjectPath},
      processManager,
      'ui-deploy'
    );
    terminal.orchestrator.process.stdout.on('data', stdoutListener);
    await terminal
      .when('exit')
      .on('process')
      .do((proc) => {
        proc.stdout.off('data', stdoutListener);
      })
      .once();
  };

  beforeAll(async () => {
    stdout = '';
    testOrgId = await getTestOrg();
    copySync(deployProject, deployProjectPath);
    platformClient = getPlatformClient(testOrgId, accessToken);
    console.log(platformClient); // TODO: remove
    processManager = new ProcessManager();
  }, defaultTimeout);

  afterAll(async () => {
    await processManager.killAllProcesses();
  });

  it(
    'happy creation path',
    async () => {
      await createNewTerminal();
      console.log('stdout', stdout);
      const regex = new RegExp('Hosted Page creation successful with id', 'gm');
      expect(stdout).toMatch(regex);
      // TODO: test /w platform client
    },
    defaultTimeout
  );
});
