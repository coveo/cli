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
import {SnapshotReportStatus} from './reportPreviewer/reportPreviewerDataModels';

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
    .setReportHandler(
      SnapshotReportStatus.ERROR,
      options.shouldAutoSync
        ? async () => {
            CliUx.ux.warn('Unsynchronized resource detected');
            const facade = new SnapshotFacade(
              snapshot,
              cfg,
              options.waitUntilDone
            );
            await facade.tryAutomaticSynchronization(!options.sync);

            CliUx.ux.action.start('Validating synchronized snapshot');
            reporter = await internalDryRun(project, snapshot, cfg, {
              ...options,
              shouldAutoSync: false,
            });
          }
        : () => CliUx.ux.action.stop(red.bold('!'))
    )
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

export function getMissingVaultEntriesReportHandler(
  snapshot: Snapshot,
  cfg: Configuration,
  projectPath?: string
) {
  return function (this: SnapshotReporter) {
    // TODO CDX-935
    // TODO CDX-936
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
