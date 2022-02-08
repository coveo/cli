import {spawnSync} from 'child_process';
import {join, resolve} from 'path';
import {homedir} from 'os';
import {ProcessManager} from './processManager';
import {Terminal} from './terminal/terminal';

const resolveBinary = (programName: string) => {
  const whereOrWhich = process.platform === 'win32' ? 'where.exe' : 'which';
  const spawner = spawnSync(whereOrWhich, [programName], {
    shell: true,
    encoding: 'utf-8',
  });
  return spawner.stdout.trim();
};

export const startMitmProxy = (
  processManager: ProcessManager,
  terminalDebugName: string = 'mitmproxy'
) => {
  const mitmPath = resolveBinary('mitmdump');
  const serverTerminal = new Terminal(
    mitmPath,
    [],
    undefined,
    processManager,
    terminalDebugName
  );
  return serverTerminal;
};

export const waitForMitmProxy = (proxyTerminal: Terminal) =>
  proxyTerminal
    .when(/Proxy server listening at/)
    .on('stdout')
    .do()
    .once();

export const getMitmProxyEnvCerts = () => ({
  NODE_EXTRA_CA_CERTS: resolve(
    homedir(),
    '.mitmproxy',
    'mitmproxy-ca-cert.pem'
  ),
});
