import {cli} from 'cli-ux';
import {Project} from '../project/project';
import {SnapshotFactory} from './snapshotFactory';
import {Snapshot, WaitUntilDoneOptions} from './snapshot';
import {red, green} from 'chalk';
import {normalize} from 'path';
import {Config, Configuration} from '../config/config';
import {SnapshotOperationTimeoutError} from '../errors';
import {
  SnapshotGenericError,
  SnapshotSynchronizationError,
} from '../errors/snapshotErrors';
import {flags} from '@oclif/command';

export interface DryRunOptions {
  deleteMissingResources?: boolean;
  snapshotId?: string;
  waitUntilDone?: WaitUntilDoneOptions;
}

export const waitFlag = {
  wait: flags.integer({
    char: 'm',
    default: Snapshot.defaultWaitOptions.wait,
    helpValue: 'seconds',
    required: false,
    description:
      'The maximum number of seconds to wait before the commands exits with a timeout error. A value of zero means that the command will wait indefinitely.',
  }),
};

export async function dryRun(
  targetOrg: string,
  projectPath: string,
  options?: DryRunOptions
) {
  const defaultOptions: DryRunOptions = {
    deleteMissingResources: false,
  };

  const opt = {...defaultOptions, ...options};
  const project = new Project(normalize(projectPath));

  const snapshot = await getSnapshotForDryRun(project, targetOrg, opt);

  cli.action.start('Validating snapshot');
  const reporter = await snapshot.validate(
    opt.deleteMissingResources,
    opt.waitUntilDone
  );

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

export async function handleReportWithErrors(
  snapshot: Snapshot,
  cfg: Configuration,
  projectPath: string
) {
  if (snapshot.requiresSynchronization()) {
    throw new SnapshotSynchronizationError(snapshot, cfg);
  }

  const pathToReport = snapshot.saveDetailedReport(projectPath);
  throw new SnapshotGenericError(snapshot, cfg, pathToReport);
}

export function handleSnapshotError(err?: Error) {
  if (err instanceof SnapshotOperationTimeoutError) {
    cli.action.stop('Incomplete');
    cli.log(err.message);
  } else if (err instanceof SnapshotSynchronizationError) {
    cli.warn(err.message);
  } else if (err instanceof SnapshotGenericError) {
    cli.error(err.message);
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
