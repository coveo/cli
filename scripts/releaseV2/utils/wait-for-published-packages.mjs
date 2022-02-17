import {backOff} from 'exponential-backoff';
import {spawnSync} from 'child_process';

function showPackage(packageName) {
  spawnSync('npm', ['show', packageName]);
}

export async function waitForPackage(packageName) {
  try {
    const pollInterval = 1e3;
    await backOff(() => showPackage(packageName), {
      delayFirstAttempt: true,
      startingDelay: pollInterval,
      maxDelay: pollInterval * 30,
    });
  } catch (err) {
    console.error(`Package ${packageName} does not exist`);
  }
}

export function waitForPackages(packagesToWait) {
  return Promise.all(packagesToWait.map(waitForPackage));
}
