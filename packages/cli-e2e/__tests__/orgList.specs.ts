import {spawnSync} from 'child_process';
import {homedir} from 'os';
import {join} from 'path';
import {resolve} from 'path';
import {CLI_EXEC_PATH} from '../utils/cli';
import {ProcessManager} from '../utils/processManager';
import {Terminal} from '../utils/terminal/terminal';

const certFolder = resolve(homedir(), '.mitmproxy');

const resolveBinary = (programName: string) => {
  const whereOrWhich = process.platform === 'win32' ? 'where.exe' : 'which';
  const spawner = spawnSync(whereOrWhich, [programName], {shell: true});
  console.log(spawner.stdout.toString());
  console.log('ERR:');
  console.log(spawner.stderr.toString());
  return spawner.stdout.toString().trim();
};

const startMitmProxy = (processManager: ProcessManager) => {
  const mitmPath = resolveBinary('mitmdump');
  const serverTerminal = new Terminal(
    mitmPath,
    [],
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
      proxyTerminal = startMitmProxy(proxyProcessManager);
      await waitForProxyRunning(proxyTerminal);
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
              NODE_EXTRA_CA_CERTS: join(certFolder, 'mitmproxy-ca-cert.pem'),
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
          /GET https:\/\/platformdev\.cloud\.coveo\.com\/rest\/organizations\s* << 200 OK/
        );
      },
      2 * 60e3
    );
  });
});
