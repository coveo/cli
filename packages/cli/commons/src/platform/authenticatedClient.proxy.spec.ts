import {execFile} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import {createServer, Server} from 'node:http';
import {AddressInfo} from 'node:net';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// The proxy is set on undici's global dispatcher, which Node's built-in fetch
// reads from the real global object. Jest runs specs in a separate global, so
// the requests have to be made from a separate Node process.
function runInChildProcess(code: string, env: NodeJS.ProcessEnv) {
  const script = `
    const globalConfig = require(${JSON.stringify(
      require.resolve('../config/globalConfig')
    )}).default;
    const {AuthenticatedClient, applyProxyFromEnvironment} = require(${JSON.stringify(
      require.resolve('./authenticatedClient')
    )});
    globalConfig.set({configDir: process.env.TEST_CONFIG_DIR});
    Promise.resolve()
      .then(async () => {${code}})
      .catch(() => {})
      .then(() => process.exit(0));
  `;
  return new Promise<void>((resolve, reject) =>
    execFile(
      process.execPath,
      ['-r', require.resolve('ts-node/register/transpile-only'), '-e', script],
      {
        env: {
          ...process.env,
          TS_NODE_PROJECT: join(__dirname, '..', '..', 'tsconfig.json'),
          ...env,
        },
        timeout: 30e3,
      },
      (error, _stdout, stderr) =>
        error ? reject(new Error(`${error.message}\n${stderr}`)) : resolve()
    )
  );
}

describe('AuthenticatedClient behind a proxy', () => {
  let proxy: Server;
  let proxyUrl: string;
  let tunnelRequests: string[];
  let configDir: string;

  beforeAll(async () => {
    proxy = createServer((_req, res) => res.writeHead(405).end());
    proxy.on('connect', (req, socket) => {
      tunnelRequests.push(req.url!);
      // Refuse the tunnel: knowing the request went through the proxy is enough.
      socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');
    });
    await new Promise<void>((resolve) => proxy.listen(0, '127.0.0.1', resolve));
    proxyUrl = `http://127.0.0.1:${(proxy.address() as AddressInfo).port}`;
  });

  beforeEach(() => {
    tunnelRequests = [];
    configDir = mkdtempSync(join(tmpdir(), 'cli-commons-proxy-'));
  });

  afterEach(() => {
    rmSync(configDir, {recursive: true, force: true});
  });

  afterAll(async () => {
    await new Promise((resolve) => proxy.close(resolve));
  });

  const unsetProxyVariables = {HTTPS_PROXY: undefined, https_proxy: undefined};

  it.each(['HTTPS_PROXY', 'https_proxy'])(
    'should send platform requests through the proxy set in %s',
    async (variable) => {
      await runInChildProcess(
        'await (await new AuthenticatedClient().getClient()).organization.list();',
        {
          ...unsetProxyVariables,
          [variable]: proxyUrl,
          TEST_CONFIG_DIR: configDir,
        }
      );

      expect(tunnelRequests).toContain('platform.cloud.coveo.com:443');
    }
  );

  // auth:login requests its token with fetch before any getClient() call.
  it('should send fetch requests through the proxy once applyProxyFromEnvironment is called', async () => {
    await runInChildProcess(
      `applyProxyFromEnvironment();
       await fetch('https://platform.cloud.coveo.com/oauth/token', {method: 'POST'});`,
      {
        ...unsetProxyVariables,
        HTTPS_PROXY: proxyUrl,
        TEST_CONFIG_DIR: configDir,
      }
    );

    expect(tunnelRequests).toContain('platform.cloud.coveo.com:443');
  });
});
