import {startSpinner} from '@coveo/cli-commons/utils/ux';
import {Project} from '../project/project.js';
import {SnapshotFactory} from './snapshotFactory.js';
import {Snapshot, WaitUntilDoneOptions} from './snapshot.js';
import {normalize} from 'path';
import {Config, Configuration} from '@coveo/cli-commons/config/config';
import {SnapshotGenericError} from '../errors/snapshotErrors.js';
import {SnapshotReporter} from './snapshotReporter.js';
import {
  VaultTransferFunctionsParam,
  tryTransferFromOrganization,
  throwSnapshotMissingVaultEntriesError,
  tryCreateMissingVaultEntries,
} from './vaultEntriesFunctions';

export interface DryRunOptions {
  deleteMissingResources?: boolean;
  snapshotId?: string;
  waitUntilDone?: WaitUntilDoneOptions;
}

async function internalDryRun(snapshot: Snapshot, options: DryRunOptions) {
  return snapshot.validate(
    options.deleteMissingResources,
    options.waitUntilDone
  );
}

export async function dryRun(
  targetOrg: string,
  projectPath: string,
  options: DryRunOptions = {}
) {
  const project = new Project(normalize(projectPath), targetOrg);
  const snapshot = await getSnapshotForDryRun(project, targetOrg, options);

  startSpinner('Validating snapshot');
  let reporter = await internalDryRun(snapshot, options);

  return {reporter, snapshot, project};
}

export function getTargetOrg(config: Config, target?: string) {
  if (target) {
    return target;
  }
  const cfg = config.get();
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

async function getSnapshotForDryRun(
  project: Project,
  targetOrg: string,
  options: DryRunOptions = {}
) {
  if (options.snapshotId) {
    startSpinner('Retrieving Snapshot');
    return SnapshotFactory.createFromExistingSnapshot(
      options.snapshotId,
      targetOrg,
      options.waitUntilDone
    );
  }
  startSpinner('Creating Snapshot');
  return SnapshotFactory.createSnapshotFromProject(
    project,
    targetOrg,
    options.waitUntilDone
  );
}
