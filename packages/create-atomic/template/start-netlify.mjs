import getPort, {portNumbers} from 'get-port';
import {spawn} from 'child_process';
import {createRequire} from 'module';
import fkill from 'fkill';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);

const main = async () => {
  // Dynamic Stencil port discovery feature, unsupported by Netlify.
  const stencilPort = await getPort({port: portNumbers(3333, 3399)});

  process.on('SIGINT', () => {
    // Intermittent issue with Netlify not shutting down Stencil port properly.
    fkill(`:${stencilPort}`, {silent: true});
  });

  spawn(
    'node',
    [
      require.resolve('netlify-cli/bin/run'),
      'dev',
      '--targetPort',
      stencilPort,
      ...args,
    ],
    {
      stdio: 'inherit',
    }
  );
};

main();
