import {CliUx} from '@oclif/core';
import {Project} from '../project/project';
import {SnapshotFactory} from './snapshotFactory';
import {Snapshot, WaitUntilDoneOptions} from './snapshot';
import {red, green} from 'chalk';
import {normalize} from 'path';
import {Config, Configuration} from '../config/config';
import {
  SnapshotGenericError,
  SnapshotMissingVaultEntriesError,
} from '../errors/snapshotErrors';
import {SnapshotFacade} from './snapshotFacade';
import {PrintableError} from '../errors/printableError';
import {SnapshotReporter} from './snapshotReporter';
import {VaultHandler} from './vaultHandler';

export interface DryRunOptions {
  sync?: boolean;
  deleteMissingResources?: boolean;
  snapshotId?: string;
  waitUntilDone?: WaitUntilDoneOptions;
}

export async function dryRun(
  targetOrg: string,
  projectPath: string,
  cfg: Configuration,
  options: DryRunOptions = {}
) {
  const project = new Project(normalize(projectPath), targetOrg);
  const snapshot = await getSnapshotForDryRun(project, targetOrg, options);

  CliUx.ux.action.start('Validating snapshot');
  let reporter = await snapshot.validate(
    options.deleteMissingResources,
    options.waitUntilDone
  );

  if (snapshot.areResourcesInError()) {
    // TODO: CDX-947: areResourcesInError does not necessarily mean there are synchronization issues.
    CliUx.ux.warn('Unsynchronized resource detected');
    const facade = new SnapshotFacade(snapshot, cfg, options.waitUntilDone);
    await facade.tryAutomaticSynchronization(!options.sync);

    CliUx.ux.action.start('Validating synchronized snapshot');
    reporter = await snapshot.validate(
      options.deleteMissingResources,
      options.waitUntilDone
    );
  }

  CliUx.ux.action.stop(reporter.isSuccessReport() ? green('✔') : red.bold('!'));
  return {reporter, snapshot, project};
}

export async function getTargetOrg(config: Config, target?: string) {
  if (target) {
    return target;
  }
  const cfg = await config.get();
  return cfg.organization;
}

export function cleanupProject(projectPath: string) {
  const project = new Project(normalize(projectPath));
  project.deleteTemporaryZipFile();
}

export function getErrorReportHandler(
  snapshot: Snapshot,
  cfg: Configuration,
  projectPath?: string
) {
  return () => {
    throw new SnapshotGenericError(snapshot, cfg, projectPath);
  };
}

export async function handleReportWithErrors(
  snapshot: Snapshot,
  cfg: Configuration,
  projectPath?: string
) {
  throw new SnapshotGenericError(snapshot, cfg, projectPath);
}

export function getMissingVaultEntriesReportHandler(
  snapshot: Snapshot,
  cfg: Configuration,
  projectPath?: string
) {
  return async function (this: SnapshotReporter) {
    // **** Pseudo-code START ****
    // * prompt if "want to transfer"
    // * get the organizationId from the project (CDX-915)
    // * check if vault entries are "transferable". i.e. find missing vault entries from origin org and compare with this.missingVaultEntries (CDX-935)
    // * if "want to transfer" && "transferable"
    //      Transfer vault entries from origin to dest org
    //      return
    //
    // * if not "transferable"
    //      log "Vault entries could not be transfered from origin to destination org"
    //
    // * prompt if "want to create vault entries manually"
    // **** Pseudo-code END ****

    const shouldCreate = await CliUx.ux.confirm(
      `\nWould you like to create the missing vault entries in the destination organization ${snapshot.targetId}? (y/n)`
    );
    if (shouldCreate) {
      const vault = new VaultHandler(snapshot.targetId);
      await vault.createEntries(Array.from(this.missingVaultEntries));
      return;
    }

    throw new SnapshotMissingVaultEntriesError(snapshot, cfg, projectPath);
  };
}

export function handleSnapshotError(err?: Error & {exitCode?: number}) {
  if (CliUx.ux.action.running && typeof err?.name === 'string') {
    CliUx.ux.action.stop(err?.name);
  }

  if (err instanceof PrintableError) {
    err.print();
  } else {
    throw err;
  }
}

async function createSnapshotFromProject(
  project: Project,
  targetOrg: string,
  options?: WaitUntilDoneOptions
): Promise<Snapshot> {
  const pathToZip = await project.compressResources();
  return SnapshotFactory.createFromZip(pathToZip, targetOrg, options);
}

async function getSnapshotForDryRun(
  project: Project,
  targetOrg: string,
  options: DryRunOptions = {}
) {
  if (options.snapshotId) {
    CliUx.ux.action.start('Retrieving Snapshot');
    return SnapshotFactory.createFromExistingSnapshot(
      options.snapshotId,
      targetOrg,
      options.waitUntilDone
    );
  }
  CliUx.ux.action.start('Creating Snapshot');
  return createSnapshotFromProject(project, targetOrg, options.waitUntilDone);
}
