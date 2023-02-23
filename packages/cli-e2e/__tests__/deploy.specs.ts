import {join} from 'path';
import PlatformClient from '@coveo/platform-client';
import {getPlatformClient} from '../utils/platform';
import {getTestOrg} from '../utils/testOrgSetup';
import {ProcessManager} from '../utils/processManager';
import {getConfig, getUIProjectPath} from '../utils/cli';
import {copySync, readJsonSync, writeJsonSync} from 'fs-extra';
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
  let stderr: string;
  const stderrListener = (chunk: string) => {
    stderr += chunk;
  };

  const addPageNameToConfig = () => {
    const configPath = join(deployProjectPath, 'coveo.deploy.json');
    const config = readJsonSync(configPath);
    const name = `hosted-page-${process.env.TEST_RUN_ID}`;
    console.log('page name', name);
    writeJsonSync(configPath, {...config, name});
  };

  const deploy = async () => {
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
    terminal.orchestrator.process.stderr.on('data', stderrListener);
    await terminal
      .when(/Creating new Hosted Page/)
      .on('stderr')
      .do()
      .once();
    await terminal.when(/✔/).on('stderr').do().once();
    // await terminal
    //   .when('exit')
    //   .on('process')
    //   .do((proc) => {
    //     proc.stdout.off('data', stdoutListener);
    //     proc.stderr.off('data', stderrListener);
    //   })
    //   .once();
  };

  beforeAll(async () => {
    testOrgId = await getTestOrg();
    copySync(deployProject, deployProjectPath);
    addPageNameToConfig();
    platformClient = getPlatformClient(testOrgId, accessToken);
    processManager = new ProcessManager();
  }, defaultTimeout);

  beforeEach(() => {
    stdout = '';
    stderr = '';
  });

  afterEach(() => {
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  });

  afterAll(async () => {
    await processManager.killAllProcesses();
  });

  it(
    'happy creation path',
    async () => {
      await deploy();
      const regex = /Hosted Page creation successful with id "(.+)"/g;
      expect(stdout).toMatch(regex);

      const matches = regex.exec(stdout)!;
      console.log('matches:', matches);
      const hostedPageId = matches[1];
      const hostedPage = await platformClient.hostedPages.get(hostedPageId);
      console.log('hostedPage:', hostedPage);
      expect(hostedPage).toBeTruthy();
    },
    defaultTimeout
  );
});
