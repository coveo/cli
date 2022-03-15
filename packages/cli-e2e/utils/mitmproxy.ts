import {spawnSync} from 'child_process';
import {resolve} from 'path';
import {homedir} from 'os';
import {ProcessManager} from './processManager';
import {Terminal} from './terminal/terminal';
import waitOn from 'wait-on';

export const MITM_BIN_NAME = 'mitmdump';

export const resolveBinary = (programName: string) => {
  const whereOrWhich = process.platform === 'win32' ? 'where.exe' : 'which';
  const spawner = spawnSync(whereOrWhich, [programName], {
    shell: true,
    encoding: 'utf-8',
  });
  return spawner.stdout.trim();
};

export const startMitmProxy = (
  processManager: ProcessManager,
  port: number,
  terminalDebugName = 'mitmproxy'
) => {
  const mitmPath = resolveBinary(MITM_BIN_NAME);
  const serverTerminal = new Terminal(
    mitmPath,
    ['--set', `listen_port=${port}`],
    undefined,
    processManager,
    terminalDebugName
  );
  serverTerminal.orchestrator.process.stdout.emit(
    'data',
    `COMMAND: ${mitmPath} ${['--set', `listen_port=${port}`].join(' ')}`
  );
  return serverTerminal;
};

export const waitForMitmProxy = (proxyTerminal: Terminal, port: number) =>
  Promise.race([
    proxyTerminal
      .when(/Proxy server listening at/)
      .on('stdout')
      .do()
      .once(),
    waitOn({resources: [`tcp:${port}`]}),
  ]);

export const getMitmProxyEnvCerts = () => ({
  NODE_EXTRA_CA_CERTS: resolve(
    homedir(),
    '.mitmproxy',
    'mitmproxy-ca-cert.pem'
  ),
});
