import {spawnSync} from 'node:child_process';
import {join, resolve} from 'node:path';
import {npm} from '../../utils/npm';
import {Terminal} from '../../utils/terminal/terminal';
import {appendCmdIfWindows} from './utils';
import {manifest as getManifest, tarball as getTarball} from 'pacote';
import {dirSync} from 'tmp';
import {writeFileSync} from 'node:fs';

const npmRegistry = 'https://registry.npmjs.org/';
const verdaccioRegistry = 'http://localhost:4873';

const verdaccioedPackages = [
  '@coveo/angular',
  '@coveo/vue-cli-plugin-typescript',
  '@coveo/cra-template',
  '@coveo/search-token-server',
  '@coveo/create-atomic',
  '@coveo/search-token-lambda',
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
    await publishTerminal.when('exit').on('process').do().once();
  }
}

export async function uplinkMissingPackages() {
  const tmpdir = dirSync().name;
  for (const packageToCheck of verdaccioedPackages) {
    const manifest = await getManifest(packageToCheck, {
      registry: verdaccioRegistry,
    });
    if (manifest.version !== '0.0.0') {
      continue;
    }
    const tarballBytes = await getTarball(packageToCheck, {
      registry: npmRegistry,
    });
    const tarballName = 'package.tgz';
    writeFileSync(join(tmpdir, tarballName), tarballBytes, {
      encoding: 'binary',
    });
    spawnSync(
      appendCmdIfWindows`npm`,
      ['publish', tarballName, '--registry=http://localhost:4873'],
      {
        cwd: tmpdir,
        stdio: 'inherit',
      }
    );
  }
}

const getDummyPackageJson = (packageName: string) =>
  JSON.stringify({packageName, version: '0.0.0'});

export function scaffoldDummyPackages() {
  const tmpdir = dirSync().name;
  for (const packageToScaffold of verdaccioedPackages) {
    writeFileSync(
      join(tmpdir, 'package.json'),
      getDummyPackageJson(packageToScaffold)
    );
    spawnSync(
      appendCmdIfWindows`npm`,
      ['publish', '--registry=http://localhost:4873'],
      {
        cwd: tmpdir,
        stdio: 'inherit',
      }
    );
  }
}
