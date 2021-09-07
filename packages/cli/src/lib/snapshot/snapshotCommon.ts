import {cli} from 'cli-ux';
import {Project} from '../project/project';
import {SnapshotFactory} from './snapshotFactory';
import {Snapshot, WaitUntilDoneOptions} from './snapshot';
import {red, green} from 'chalk';
import {normalize} from 'path';
import {Config, Configuration} from '../config/config';
import {SnapshotError, SnapshotGenericError} from '../errors/snapshotErrors';
import {SnapshotFacade} from './snapshotFacade';

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
  const project = new Project(normalize(projectPath));
  const snapshot = await getSnapshotForDryRun(project, targetOrg, options);

  cli.action.start('Validating snapshot');
  let reporter = await snapshot.validate(
    options.deleteMissingResources,
    options.waitUntilDone
  );

  if (snapshot.requiresSynchronization()) {
    cli.warn('Unsynchronized resource detected');
    const facade = new SnapshotFacade(snapshot, cfg);
    await facade.tryAutomaticSynchronization(options.sync);

    cli.action.start('Validating synchronized snapshot');
    reporter = await snapshot.validate(
      options.deleteMissingResources,
      options.waitUntilDone
    );
  }

  cli.action.stop(reporter.isSuccessReport() ? green('✔') : red.bold('!'));
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

export async function handleReportWithErrors(
  snapshot: Snapshot,
  cfg: Configuration,
  projectPath?: string
) {
  throw new SnapshotGenericError(snapshot, cfg, projectPath);
}

export function handleSnapshotError(err?: Error) {
  if (cli.action.running) {
    cli.action.stop(err?.name);
  }

  if (err instanceof SnapshotError) {
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
    cli.action.start('Retrieving Snapshot');
    return SnapshotFactory.createFromExistingSnapshot(
      options.snapshotId,
      targetOrg,
      options.waitUntilDone
    );
  }
  cli.action.start('Creating Snapshot');
  return createSnapshotFromProject(project, targetOrg, options.waitUntilDone);
}
