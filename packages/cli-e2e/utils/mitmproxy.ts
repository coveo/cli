import {join, resolve} from 'path';
import {homedir} from 'os';
import {ProcessManager} from './processManager';
import {Terminal} from './terminal/terminal';
import waitOn from 'wait-on';

export const startMitmProxy = (
  processManager: ProcessManager,
  terminalDebugName = 'mitmproxy'
) => {
  const mitmScript = join(__dirname, '..', 'mitmproxy', 'main.py');
  const serverTerminal = new Terminal(
    'python',
    [
      '-u',
      mitmScript,
      '-p',
      '8080',
      '--listen-host',
      'localhost',
      '--flow-detail',
      '1',
    ],
    undefined,
    processManager,
    terminalDebugName
  );
  return serverTerminal;
};

const mitmProxyCertPath = resolve(
  homedir(),
  '.mitmproxy',
  'mitmproxy-ca-cert.pem'
);

export const waitForMitmProxy = () =>
  waitOn({resources: ['tcp:8080', `file:${mitmProxyCertPath}`]});

export const getMitmProxyEnvCerts = () => ({
  NODE_EXTRA_CA_CERTS: mitmProxyCertPath,
});
