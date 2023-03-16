import {spawnSync} from 'node:child_process';
import {join, resolve} from 'node:path';
import {npm} from '../../utils/npm';
import {Terminal} from '../../utils/terminal/terminal';
import {appendCmdIfWindows} from './utils';
import {tarball as getTarball} from 'pacote';
import {dirSync} from 'tmp';
import {writeFileSync} from 'node:fs';

const npmRegistry = 'https://registry.npmjs.org/';
const verdaccioRegistry = 'http://localhost:4873';

const verdaccioedPackages = [
  '@coveo/angular',
  '@coveo/create-headless-vue',
  '@coveo/cra-template',
  '@coveo/search-token-server',
  '@coveo/create-atomic',
  '@coveo/cli-commons-dev',
  '@coveo/cli-commons',
  '@coveo/cli',
];

export async function publishPackages() {
  for (const phase of ['nx:graph', 'release:phase1']) {
    const args = [...npm(), 'run', phase];
    const publishTerminal = new Terminal(
      args.shift()!,
      args,
      {
        cwd: resolve(join(__dirname, '..', '..', '..')),
        env: {
          ...process.env,
          npm_config_registry: verdaccioRegistry,
          DEBUG: '*',
        },
      },
      global.processManager!,
      'npmPublish'
    );
    publishTerminal.orchestrator.process.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    publishTerminal.orchestrator.process.stderr.on('data', (data) => {
      console.log(data.toString());
    });
    await publishTerminal
      .when('exit')
      .on('process')
      .do((process) => {
        if (process.exitCode) {
          throw new Error('Error while publishing packages');
        }
      })
      .once();
  }
}

export async function scaffoldDummyPackages() {
  const tmpdir = dirSync().name;
  for (const packageToCheck of verdaccioedPackages) {
    const tarballBytes = await getTarball(packageToCheck, {
      registry: npmRegistry,
    });
    const tarballName = 'package.tgz';
    writeFileSync(join(tmpdir, tarballName), tarballBytes, {
      encoding: 'binary',
    });
    spawnSync(
      appendCmdIfWindows`npm`,
      ['publish', tarballName, `--registry=${verdaccioRegistry}`],
      {
        cwd: tmpdir,
        stdio: 'inherit',
      }
    );
  }
}
