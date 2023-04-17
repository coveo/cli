import Arborist from '@npmcli/arborist';
import type {Content as PackageJson} from '@npmcli/package-json';
import {ConfigRuntime} from '@verdaccio/types';
import {ChildProcess, fork} from 'node:child_process';
import {writeFileSync, mkdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {createRequire} from 'node:module';
import {dirSync, tmpNameSync} from 'tmp';
import {npmSync as npm} from '@coveo/do-npm';
import getPort from 'get-port';
const require = createRequire(import.meta.url);

export async function startVerdaccio(
  packagesToProxy: string[] | string,
  includeLocalDependent = true,
  publishProxiedPackages = true
): Promise<{verdaccioProcess: ChildProcess; verdaccioUrl: string}> {
  if (typeof packagesToProxy === 'string') {
    return startVerdaccio(
      [packagesToProxy],
      includeLocalDependent,
      publishProxiedPackages
    );
  }
  const computedPackagesToProxy = new Map<string, string[]>();

  if (!includeLocalDependent) {
    packagesToProxy.forEach((packageName) =>
      computedPackagesToProxy.set(packageName, [])
    );
  } else {
    await computePackagesToProxy(
      Array.from(packagesToProxy),
      computedPackagesToProxy
    );
  }
  const port = await getPort();
  const configPath = computeVerdaccioConfig(computedPackagesToProxy.keys());
  const verdaccioProcess = await runVerdaccio(configPath, port);
  const verdaccioUrl = `http://localhost:${port}`;
  if (publishProxiedPackages) {
    const npmrcPath = fakeNpmAuth(port);
    doPublishProxiedPackages(computedPackagesToProxy, verdaccioUrl, npmrcPath);
  }

  return {verdaccioProcess, verdaccioUrl};
}

async function computePackagesToProxy(
  packagesToProxy: string[],
  computedPackagesToProxy: Map<string, string[]>
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
    const currentPackageJson = workspacePackages.get(currentPackage);
    const dependencies = [
      ...Object.keys(currentPackageJson?.dependencies ?? {}),
      ...Object.keys(currentPackageJson?.peerDependencies ?? {}),
    ].filter((dep) => dep && workspacePackages.has(dep));

    computedPackagesToProxy.set(currentPackage, dependencies);
    packagesToProxy.push(...dependencies);
  }
}

function runVerdaccio(
  configPath: string,
  verdaccioPort: number
): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const childFork = fork(
      require.resolve('verdaccio/bin/verdaccio'),
      ['--config', configPath, '--listen', verdaccioPort.toString()],
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

function computeVerdaccioConfig(packagesToProxy: Iterable<string>) {
  const tmpDir = dirSync({unsafeCleanup: true});
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

function doPublishProxiedPackages(
  computedPackagesToProxy: Map<string, string[]>,
  verdaccioUrl: string,
  npmConfigPath: string
) {
  const computedPackagesToProxyArray = Array.from(computedPackagesToProxy);
  const visitedSinceLastPublish = [];
  while (computedPackagesToProxyArray.length > 0) {
    if (
      visitedSinceLastPublish.length === computedPackagesToProxyArray.length
    ) {
      throw new Error(
        `Error while preping verdaccio probably due to circular dependencies
      - visitedSinceLastPublish: ${JSON.stringify(visitedSinceLastPublish)}
      - computedPackageToProxyArray: ${JSON.stringify(
        computedPackagesToProxyArray
      )}`
      );
    }

    const currentPackage = computedPackagesToProxyArray.shift();
    // If the package has some unpublished local deps, push it back into the list and mark it as visited
    if (
      currentPackage[1].some((dependencyName) =>
        computedPackagesToProxyArray.some(
          (packageEntryYetToPublish) =>
            packageEntryYetToPublish[0] === dependencyName
        )
      )
    ) {
      visitedSinceLastPublish.includes(currentPackage[0]) ||
        visitedSinceLastPublish.push(currentPackage[0]);
      computedPackagesToProxyArray.push(currentPackage);
      continue;
    }

    const packageDirectory = dirname(
      require.resolve(join(currentPackage[0], 'package.json'))
    );
    npm(['publish'], {
      env: {
        ...process.env,
        npm_config_registry: verdaccioUrl,
        npm_config_userconfig: npmConfigPath,
      },
      stdio: 'ignore',
      cwd: packageDirectory,
    });

    visitedSinceLastPublish.length = 0;
  }
  // San-check: we should not have any visits on the last publish.
  if (visitedSinceLastPublish.length) {
    throw new Error(
      `Error while preping verdaccio probably due to circular dependencies
    - visitedSinceLastPublish: ${JSON.stringify(visitedSinceLastPublish)}
    - computedPackageToProxy: ${JSON.stringify(computedPackagesToProxy)}`
    );
  }
}

function getPackagesConfig(packagesToProxy: Iterable<string>) {
  const packages = {};
  for (const packageToProxy of packagesToProxy) {
    Object.assign(packages, {
      [packageToProxy]: {
        access: ['$all', '$anonymous'],
        publish: ['$all', '$anonymous'],
      },
    });
  }
  packages['**'] = {
    access: ['$all', '$anonymous'],
    publish: ['$all', '$anonymous'],
    proxy: ['npmjs'],
  };
  return packages;
}

function fakeNpmAuth(verdaccioPort: number) {
  const tmpNpmRc = tmpNameSync();
  writeFileSync(
    tmpNpmRc,
    `//localhost:${verdaccioPort}/:_authToken = OH_WOW_LOOK_A_SECRET`
  );
  return tmpNpmRc;
}
