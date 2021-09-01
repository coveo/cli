import {cli} from 'cli-ux';
import {Project} from '../project/project';
import {SnapshotFactory} from './snapshotFactory';
import {Snapshot, WaitUntilDoneOptions} from './snapshot';
import {red, green} from 'chalk';
import {normalize} from 'path';
import {Config, Configuration} from '../config/config';
import {SnapshotError, SnapshotGenericError} from '../errors/snapshotErrors';
import {flags} from '@oclif/command';
import {SnapshotFacade} from './snapshotFacade';

export interface DryRunOptions {
  deleteMissingResources?: boolean;
  snapshotId?: string;
  waitUntilDone?: WaitUntilDoneOptions;
}

export const waitFlag = {
  wait: flags.integer({
    char: 'w',
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

export function cleanupProject(projectPath: string) {
  const project = new Project(normalize(projectPath));
  project.deleteTemporaryZipFile();
}

export async function handleReportWithErrors(
  snapshot: Snapshot,
  cfg: Configuration,
  projectPath?: string
) {
  if (snapshot.requiresSynchronization()) {
    cli.warn('Unsynchronized resource detected');
    const facade = new SnapshotFacade(snapshot, cfg);
    await facade.tryAutomaticSynchronization();
  } else {
    throw new SnapshotGenericError(snapshot, cfg, projectPath);
  }
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
