import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {minVersion, satisfies, validRange} from 'semver';

// Checks @coveo/cli's production dependency tree, as recorded in the root
// package-lock.json, against the Node versions @coveo/cli supports.

interface LockEntry {
  version?: string;
  link?: boolean;
  resolved?: string;
  engines?: {node?: string} | string[];
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

const repoRoot = join(__dirname, '..', '..', '..', '..');
const cliLocation = 'packages/cli/core';
const lockedPackages: Record<string, LockEntry> = JSON.parse(
  readFileSync(join(repoRoot, 'package-lock.json'), 'utf8')
).packages;
const cliEngines: string = JSON.parse(
  readFileSync(join(repoRoot, cliLocation, 'package.json'), 'utf8')
).engines.node;

// Node's module resolution, over package-lock.json locations.
function resolveDependency(from: string, name: string) {
  let dir = from;
  for (;;) {
    const location = `${dir ? `${dir}/` : ''}node_modules/${name}`;
    if (lockedPackages[location]) {
      return location;
    }
    if (!dir) {
      return null;
    }
    const parent = dir.lastIndexOf('/node_modules/');
    dir = parent >= 0 ? dir.slice(0, parent) : '';
  }
}

function getProductionDependencies() {
  const found = new Map<string, LockEntry>();
  const toVisit = [cliLocation];
  while (toVisit.length) {
    let location = toVisit.pop()!;
    if (lockedPackages[location].link) {
      location = lockedPackages[location].resolved!;
    }
    if (found.has(location)) {
      continue;
    }
    const entry = lockedPackages[location];
    found.set(location, entry);
    const dependencies = {
      ...entry.dependencies,
      ...entry.optionalDependencies,
    };
    for (const name of Object.keys(dependencies)) {
      const resolved = resolveDependency(location, name);
      if (resolved) {
        toVisit.push(resolved);
      }
    }
  }
  return found;
}

const nameOf = (location: string) => {
  const nodeModules = location.lastIndexOf('node_modules/');
  return nodeModules >= 0
    ? location.slice(nodeModules + 'node_modules/'.length)
    : location;
};

describe('@coveo/cli production dependencies', () => {
  const productionDependencies = getProductionDependencies();

  it('should include the packages @coveo/cli loads', () => {
    expect(productionDependencies.has('packages/cli/commons')).toBe(true);
    expect(productionDependencies.has('node_modules/@oclif/core')).toBe(true);
  });

  // A dist-tag such as `latest` makes a fresh install pick the newest version
  // whatever Node it needs (fetch-undici-polyfill's `undici: latest` crashed
  // @coveo/cli at load on Node 18 and 20 once undici 8 came out).
  it('should not request any dependency by dist-tag', () => {
    const distTagged: string[] = [];
    for (const [location, entry] of productionDependencies) {
      const dependencies = {
        ...entry.dependencies,
        ...entry.optionalDependencies,
      };
      for (const [name, range] of Object.entries(dependencies)) {
        if (/^[a-z][\w.-]*$/i.test(range) && !validRange(range)) {
          distTagged.push(`${nameOf(location)} -> ${name}@${range}`);
        }
      }
    }
    expect(distTagged).toEqual([]);
  });

  it('should only contain packages that support the oldest Node version @coveo/cli supports', () => {
    const oldestNode = minVersion(cliEngines)!.version;
    const unsupported: string[] = [];
    for (const [location, entry] of productionDependencies) {
      const nodeEngine =
        entry.engines && !Array.isArray(entry.engines)
          ? entry.engines.node
          : undefined;
      if (nodeEngine && !satisfies(oldestNode, nodeEngine)) {
        unsupported.push(
          `${nameOf(location)}@${entry.version} (node ${nodeEngine})`
        );
      }
    }
    expect(unsupported).toEqual([]);
  });
});
