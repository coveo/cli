import getPort from 'get-port';
import {spawnSync} from 'child_process';
import fkill from 'fkill';
const appendCmdIfWindows = (cmd) =>
  `${cmd}${process.platform === 'win32' ? '.cmd' : ''}`;

const args = process.argv.slice(2);

const main = async () => {
  // Dynamic Stencil port discovery feature, unsupported by Netlify.
  const stencilPort =
    process.env.STENCIL_PORT || (await getPort({port: [3333]}));

  process.on('SIGINT', () => {
    // Intermittent issue with Netlify not shutting down Stencil port properly.
    fkill(`:${stencilPort}`, {silent: true});
  });

  spawnSync(
    appendCmdIfWindows`netlify`,
    ['dev', '--targetPort', stencilPort, ...args],
    {
      stdio: 'inherit',
      env: {STENCIL_PORT: stencilPort, ...process.env},
    }
  );
};

main();
