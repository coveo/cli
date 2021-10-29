import {homedir} from 'os';
import {resolve} from 'path';
import {CLI_EXEC_PATH} from '../utils/cli';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

const startMitmProxy = async (processManager: ProcessManager) => {
  const args = [
    'docker',
    'run',
    '-i',
    '--rm',
    '-v',
    `${resolve(homedir(), '.mitmproxy')}:/home/mitmproxy/.mitmproxy`,
    '-p',
    '8080:8080',
    'mitmproxy/mitmproxy',
    'mitmdump',
  ];
  const serverTerminal = new Terminal(
    args.shift()!,
    args,
    undefined,
    processManager,
    'mitmproxy'
  );
  return serverTerminal;
};

const waitForProxyRunning = (proxyTerminal: Terminal) =>
  proxyTerminal
    .when(/Proxy server listening at/)
    .on('stdout')
    .do()
    .once();

describe('org:list', () => {
  const processManagers: ProcessManager[] = [];

  describe('when using a proxy', () => {
    let proxyTerminal: Terminal;

    beforeAll(async () => {
      const proxyProcessManager = new ProcessManager();
      processManagers.push(proxyProcessManager);
      proxyTerminal = await startMitmProxy(proxyProcessManager);
      await waitForProxyRunning(proxyTerminal);
    });

    afterAll(async () => {
      await Promise.all(
        processManagers.map((manager) => manager.killAllProcesses())
      );
    });

    it('should query the list of orgs throught the proxy', async () => {
      let proxyStdout = '';
      const proxyStdoutListener = (chunk: string) => {
        proxyStdout += chunk;
      };
      proxyTerminal.orchestrator.process.on('data', proxyStdoutListener);
      const args: string[] = [CLI_EXEC_PATH, 'org:list'];
      if (process.platform === 'win32') {
        args.unshift('node');
      }
      const cliProcessManager = new ProcessManager();
      processManagers.push(cliProcessManager);
      const cliTerminal = new Terminal(
        args.shift()!,
        args,
        undefined,
        cliProcessManager,
        'auth-login'
      );

      await cliTerminal
        .when('exit')
        .on('process')
        .do(() => {
          proxyTerminal.orchestrator.process.stdout.off(
            'data',
            proxyStdoutListener
          );
        })
        .once();

      expect(proxyStdout).toMatch(
        /GET https:\/\/platformdev\.cloud\.coveo\.com\/rest\/organizations\s* << 200 OK/
      );
    });
  });
});
