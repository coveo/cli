import getPort, {portNumbers} from 'get-port';
import {spawn} from 'child_process';
import {createRequire} from 'module';
import fkill from 'fkill';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);

const main = async () => {
  // Dynamic Stencil port discovery feature, unsupported by Netlify.
  const stencilPort =
    process.env.STENCIL_PORT || (await getPort({port: [3333]}));

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
      env: {STENCIL_PORT: stencilPort, ...process.env},
    }
  );
};

main();
