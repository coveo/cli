import {CliUx} from '@oclif/core';
import {Project} from '../project/project';
import {SnapshotFactory} from './snapshotFactory';
import {Snapshot, WaitUntilDoneOptions} from './snapshot';
import {red, green} from 'chalk';
import {normalize} from 'path';
import {Config, Configuration} from '../config/config';
import {SnapshotGenericError} from '../errors/snapshotErrors';
import {SnapshotFacade} from './snapshotFacade';
import {PrintableError} from '../errors/printableError';
import {SnapshotReporter} from './snapshotReporter';
import {SnapshotReportStatus} from './reportPreviewer/reportPreviewerDataModels';
import {
  VaultTransferFunctionsParam,
  tryTransferFromOrganization,
  tryCreateMissingVaultEntries,
  throwSnapshotMissingVaultEntriesError,
} from './vaultEntriesFunctions';

export interface DryRunOptions {
  sync?: boolean;
  deleteMissingResources?: boolean;
  snapshotId?: string;
  waitUntilDone?: WaitUntilDoneOptions;
  shouldAutoSync?: boolean;
}

const defaultDryRunOptions: DryRunOptions = {
  shouldAutoSync: true,
};

async function tryAutomaticSynchronization(
  snapshot: Snapshot,
  cfg: Configuration,
  options: DryRunOptions
) {
  const facade = new SnapshotFacade(snapshot, cfg, options.waitUntilDone);
  await facade.tryAutomaticSynchronization(!options.sync);
}

async function internalDryRun(
  project: Project,
  snapshot: Snapshot,
  cfg: Configuration,
  options: DryRunOptions
) {
  let reporter = await snapshot.validate(
    options.deleteMissingResources,
    options.waitUntilDone
  );

  await reporter
    .setReportHandler(SnapshotReportStatus.SUCCESS, () => {
      CliUx.ux.action.stop(green('✔'));
    })
    .setReportHandler(SnapshotReportStatus.ERROR, async () => {
      if (!options.shouldAutoSync) {
        CliUx.ux.action.stop(red.bold('!'));
        return;
      }
      CliUx.ux.warn('Unsynchronized resource detected');
      await tryAutomaticSynchronization(snapshot, cfg, options);

      CliUx.ux.action.start('Validating synchronized snapshot');
      reporter = await internalDryRun(project, snapshot, cfg, {
        ...options,
        shouldAutoSync: false,
      });
    })
    .handleReport();
  return reporter;
}

export async function dryRun(
  targetOrg: string,
  projectPath: string,
  cfg: Configuration,
  options: DryRunOptions = {}
) {
  options = {...defaultDryRunOptions, ...options};
  const project = new Project(normalize(projectPath), targetOrg);
  const snapshot = await getSnapshotForDryRun(project, targetOrg, options);

  CliUx.ux.action.start('Validating snapshot');
  let reporter = await internalDryRun(project, snapshot, cfg, options);

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

type MissingVaultEntriesReportSubHandler = (
  param: VaultTransferFunctionsParam
) => Promise<boolean> | Promise<never> | boolean | never;

const missingVaultEntriesSubHandlers: MissingVaultEntriesReportSubHandler[] = [
  tryTransferFromOrganization,
  tryCreateMissingVaultEntries,
  throwSnapshotMissingVaultEntriesError,
];

export function getMissingVaultEntriesReportHandler(
  snapshot: Snapshot,
  cfg: Configuration,
  projectPath?: string
) {
  return async function (this: SnapshotReporter) {
    for (const subHandler of missingVaultEntriesSubHandlers) {
      if (await subHandler({reporter: this, snapshot, cfg, projectPath})) {
        break;
      }
    }
  };
}

export function handleSnapshotError(err?: Error & {exitCode?: number}) {
  let message = red.bold('!');
  if (CliUx.ux.action.running && typeof err?.name === 'string') {
    message += ` ${err?.name}`;
  }
  CliUx.ux.action.stop(message);

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
