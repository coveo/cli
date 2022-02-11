import {CLI_EXEC_PATH} from '../utils/cli';
import {
  getMitmProxyEnvCerts,
  startMitmProxy,
  waitForMitmProxy,
} from '../utils/mitmproxy';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

describe('org:list', () => {
  const processManagers: ProcessManager[] = [];

  describe('when using a proxy', () => {
    let proxyTerminal: Terminal;

    beforeAll(async () => {
      const proxyProcessManager = new ProcessManager();
      processManagers.push(proxyProcessManager);
      proxyTerminal = startMitmProxy(proxyProcessManager);
      await waitForMitmProxy(proxyTerminal);
    });

    afterAll(async () => {
      await Promise.all(
        processManagers.map((manager) => manager.killAllProcesses())
      );
    }, 2 * 60e3);

    it(
      'should query the list of orgs throught the proxy',
      async () => {
        let proxyStdout = '';
        const proxyStdoutListener = (chunk: string) => {
          proxyStdout += chunk;
        };
        proxyTerminal.orchestrator.process.stdout.on(
          'data',
          proxyStdoutListener
        );
        const args: string[] = [CLI_EXEC_PATH, 'org:list'];
        if (process.platform === 'win32') {
          args.unshift('node');
        }
        const cliProcessManager = new ProcessManager();
        processManagers.push(cliProcessManager);
        const cliTerminal = new Terminal(
          args.shift()!,
          args,
          {
            env: {
              ...process.env,
              ...getMitmProxyEnvCerts(),
              HTTPS_PROXY: 'http://localhost:8080',
            },
          },
          cliProcessManager,
          'org-list-proxied'
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
          /GET https:\/\/platform[a-z]*\.cloud\.coveo\.com\/rest\/organizations\s* << 200 OK/
        );
      },
      2 * 60e3
    );
  });
});
