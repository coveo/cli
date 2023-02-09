import Arborist from '@npmcli/arborist';
import type {Content as PackageJson} from '@npmcli/package-json';
import {ConfigRuntime} from '@verdaccio/types';
import {ChildProcess, fork} from 'node:child_process';
import {writeFileSync, mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {createRequire} from 'node:module';
import {dirSync} from 'tmp';
import {npmSync as npm} from '@coveo/do-npm';

const require = createRequire(import.meta.url);

export async function startVerdaccio(
  packagesToProxy: string[] | string,
  includeLocalDependent = true,
  publishProxiedPackages = true
): Promise<ChildProcess> {
  if (typeof packagesToProxy === 'string') {
    return startVerdaccio([packagesToProxy], includeLocalDependent);
  }
  const computedPackagesToProxy = new Set<string>();

  if (!includeLocalDependent) {
    packagesToProxy.forEach(computedPackagesToProxy.add);
  } else {
    await computePackagesToProxy(
      Array.from(packagesToProxy),
      computedPackagesToProxy
    );
  }

  const configPath = computeVerdaccioConfig(computedPackagesToProxy);
  const verdaccioProcess = await runVerdaccio(configPath);

  if (publishProxiedPackages) {
    doPublishProxiedPackages(computedPackagesToProxy);
  }

  return verdaccioProcess;
}

async function computePackagesToProxy(
  packagesToProxy: string[],
  computedPackagesToProxy: Set<string>
) {
  const workspacePackages: Map<string, PackageJson> =
    await getWorkspacePackages();
  while (packagesToProxy.length > 0) {
    const currentPackage = packagesToProxy.pop()!;
    if (computedPackagesToProxy.has(currentPackage)) {
      continue;
    }
    if (!workspacePackages.has(currentPackage)) {
      continue;
    }
    computedPackagesToProxy.add(currentPackage);
    const currentPackageJson = workspacePackages.get(currentPackage);
    packagesToProxy.push(
      ...Object.keys(currentPackageJson?.dependencies ?? {}),
      ...Object.keys(currentPackageJson?.peerDependencies ?? {})
    );
  }
}

function runVerdaccio(configPath: string): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const childFork = fork(
      require.resolve('verdaccio/bin/verdaccio'),
      ['--config', configPath],
      {stdio: 'ignore'}
    );
    childFork.on('message', (msg: {verdaccio_started: boolean}) => {
      if (msg.verdaccio_started) {
        resolve(childFork);
      }
    });
    childFork.on('error', (err: any) => reject([err]));
    childFork.on('disconnect', (err: any) => reject([err]));
  });
}

async function getWorkspacePackages() {
  const workspacePackages = new Map<string, PackageJson>();
  const arb = new Arborist({path: process.env['npm_config_local_prefix']});
  await arb.loadActual();
  for (const child of arb.actualTree.fsChildren) {
    if (!child.package.name) {
      continue;
    }
    workspacePackages.set(child.package.name, child.package);
  }
  return workspacePackages;
}

function computeVerdaccioConfig(packagesToProxy: Set<string>) {
  const tmpDir = dirSync();
  const storagePath = join(tmpDir.name, 'storage');
  mkdirSync(storagePath);
  const packages = getPackagesConfig(packagesToProxy);
  const config: ConfigRuntime = {
    self_path: 'foo',
    security: {
      api: {legacy: true},
      web: {
        sign: {ignoreExpiration: true},
        verify: {ignoreExpiration: true},
      },
    },
    uplinks: {
      npmjs: {
        url: 'https://registry.npmjs.org/',
        cache: false,
      },
    },
    packages,
    storage: storagePath,
  };
  const tmpFile = join(tmpDir.name, 'config.json');
  writeFileSync(tmpFile, JSON.stringify(config));
  return tmpFile;
}

function doPublishProxiedPackages(computedPackagesToProxy: Set<string>) {
  for (const packageToProxy of computedPackagesToProxy) {
    const packageDirectory = dirname(require.resolve(packageToProxy));
    npm(['publish'], {
      env: {...process.env, npm_config_registry: 'http://localhost:4873'},
      cwd: packageDirectory,
    });
  }
}

function getPackagesConfig(packagesToProxy: Set<string>) {
  const packages = {};
  for (const packageToProxy of packagesToProxy.values()) {
    Object.assign(packages, {
      [packageToProxy]: {
        access: ['$all'],
        publish: ['$all'],
      },
    });
  }
  packages['**'] = {
    access: ['$all'],
    publish: ['$all'],
    proxy: ['npmjs'],
  };
  return packages;
}
