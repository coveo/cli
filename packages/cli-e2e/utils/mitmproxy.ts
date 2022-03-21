import {join, resolve} from 'path';
import {homedir} from 'os';
import {ProcessManager} from './processManager';
import {Terminal} from './terminal/terminal';
import waitOn from 'wait-on';

export const startMitmProxy = (
  processManager: ProcessManager,
  terminalDebugName = 'mitmproxy'
) => {
  process.stdout.write(JSON.stringify(process.env));
  const mitmScript = join(__dirname, '..', 'mitmproxy', 'main.py');
  const serverTerminal = new Terminal(
    'python',
    [mitmScript],
    undefined,
    processManager,
    terminalDebugName
  );
  return serverTerminal;
};

export const waitForMitmProxy = () => waitOn({resources: ['tcp:8080']});

export const getMitmProxyEnvCerts = () => ({
  NODE_EXTRA_CA_CERTS: resolve(
    homedir(),
    '.mitmproxy',
    'mitmproxy-ca-cert.pem'
  ),
});
