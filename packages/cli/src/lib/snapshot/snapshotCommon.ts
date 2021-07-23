import {cli} from 'cli-ux';
import {Project} from '../project/project';
import {SnapshotFactory} from './snapshotFactory';
import {Snapshot} from './snapshot';
import {red, green, blueBright} from 'chalk';
import {normalize} from 'path';
import {SnapshotUrlBuilder} from './snapshotUrlBuilder';
import dedent from 'ts-dedent';
import {Config, Configuration} from '../config/config';
import {SnapshotOperationTimeoutError} from '../errors';

export interface dryRunOptions {
  deleteMissingResources?: boolean;
}

export async function dryRun(
  targetOrg: string,
  projectPath: string,
  options?: dryRunOptions
) {
  const defaultOptions: Required<dryRunOptions> = {
    deleteMissingResources: false,
  };

  const opt = {...defaultOptions, ...options};
  const project = new Project(normalize(projectPath));

  cli.action.start('Creating snapshot');
  const snapshot = await createSnapshotFromProject(project, targetOrg);

  cli.action.start('Validating snapshot');
  const reporter = await snapshot.validate(opt.deleteMissingResources);

  cli.action.stop(reporter.isSuccessReport() ? green('✔') : red.bold('!'));
  return {reporter, snapshot, project};
}

export function displayInvalidSnapshotError(
  snapshot: Snapshot,
  cfg: Configuration,
  projectPath: string
) {
  const report = snapshot.latestReport;
  const urlBuilder = new SnapshotUrlBuilder(cfg);
  const snapshotUrl = urlBuilder.getSnapshotPage(snapshot);
  const pathToReport = snapshot.saveDetailedReport(projectPath);

  cli.error(
    dedent`Invalid snapshot - ${report.resultCode}.
        Detailed report saved at ${pathToReport}.

        You can also use this link to view the snapshot in the Coveo Admin Console
        ${snapshotUrl}`
  );
}

export function displaySnapshotSynchronizationWarning(
  snapshot: Snapshot,
  cfg: Configuration
) {
  const urlBuilder = new SnapshotUrlBuilder(cfg);
  const synchronizationPlanUrl = urlBuilder.getSynchronizationPage(snapshot);
  cli.warn(
    dedent`
      Some conflicts were detected while comparing changes between the snapshot and the target organization.
      Click on the URL below to synchronize your snapshot with your organization before running another push command.
      ${synchronizationPlanUrl}
      `
  );
}

export async function getTargetOrg(config: Config, target?: string) {
  if (target) {
    return target;
  }
  const cfg = await config.get();
  return cfg.organization;
}

export function handleSnapshotError(err?: Error) {
  if (err instanceof SnapshotOperationTimeoutError) {
    cli.log(operationGettingTooMuchTimeMessage(err.snapshot));
  } else {
    throw err;
  }
}

function operationGettingTooMuchTimeMessage(snapshot: Snapshot): string {
  return dedent`Snapshot ${
    snapshot.latestReport.type
  } operation is taking a long time to complete.
  Run the following command to monitor the operation:

    ${blueBright`coveo org:config:monitor ${snapshot.id} -t ${snapshot.targetId}`}`;
}

async function createSnapshotFromProject(
  project: Project,
  targetOrg: string
): Promise<Snapshot> {
  const pathToZip = await project.compressResources();
  return SnapshotFactory.createFromZip(pathToZip, targetOrg);
}
