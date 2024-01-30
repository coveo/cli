import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('auth:token', () => {
  let stdout: string;
  let processManager: ProcessManager;

  const accessToken = 'xx564559b1-0045-48e1-953c-3addd1ee4457'; // searchuisample public token
  const stdoutListener = (chunk: string) => {
    stdout += chunk;
  };

  afterEach(async () => {
    await processManager.killAllProcesses();
  }, 5e3);

  function authenticate() {
    const args: string[] = [
      'echo',
      accessToken,
      '|',
      'node',
      process.env.CLI_EXEC_PATH!,
      'auth:token',
      '-o=searchuisamples',
    ];

    const terminal = new Terminal(
      args.shift()!,
      args,
      undefined,
      processManager,
      'auth-token'
    );

    return terminal.when('exit').on('process').do().once();
  }

  it('should authenticate to searchuisamples organization', async () => {
    await authenticate();

    const args: string[] = ['node', process.env.CLI_EXEC_PATH!, 'config:get'];

    const configGetTerminal = new Terminal(
      args.shift()!,
      args,
      undefined,
      processManager,
      'config-get'
    );

    await configGetTerminal
      .when('exit')
      .on('process')
      .do((proc) => {
        proc.stdout.off('data', stdoutListener);
      })
      .once();

    const accessTokenRgx = new RegExp(`^${accessToken}$`);
    expect(stdout).toMatch(accessTokenRgx);
  }, 10e3);
});
