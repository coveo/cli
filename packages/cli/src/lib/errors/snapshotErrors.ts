import {blueBright} from 'chalk';
import {cli} from 'cli-ux';
import dedent from 'ts-dedent';
import {Configuration} from '../config/config';
import {Snapshot} from '../snapshot/snapshot';
import {SnapshotUrlBuilder} from '../snapshot/snapshotUrlBuilder';

type severityLevel = 'info' | 'warn' | 'error';

interface IDetailedReportable extends SnapshotError {
  snapshot: Snapshot;
  level: severityLevel;
  projectPath?: string;
}

function trySavingDetailedReport(error: IDetailedReportable) {
  if (error.projectPath) {
    const reportPath = error.snapshot.saveDetailedReport(error.projectPath);
    error.message += dedent`\n\n
          Detailed report saved at ${reportPath}`;
  }
}

export class SnapshotError extends Error {
  public constructor(public level: severityLevel) {
    super();
  }

  public print() {
    cli.log();
    cli[this.level]('\n' + this.message);
  }
}

export class SnapshotOperationTimeoutError
  extends SnapshotError
  implements IDetailedReportable
{
  public name = 'Snapshot Operation Timeout Error';
  public constructor(public snapshot: Snapshot) {
    super('info');
    this.message = dedent`${
      snapshot.latestReport.type
    } operation is taking a long time to complete.
    Run the following command to monitor the operation:

      ${blueBright`coveo org:config:monitor ${snapshot.id} -t ${snapshot.targetId}`}`;
  }
}

export class SnapshotSynchronizationError
  extends SnapshotError
  implements IDetailedReportable
{
  public name = 'Snapshot Synchronization Error';
  public constructor(
    public snapshot: Snapshot,
    public cfg: Configuration,
    public projectPath?: string
  ) {
    super('warn');
    const urlBuilder = new SnapshotUrlBuilder(cfg);
    const synchronizationPlanUrl = urlBuilder.getSynchronizationPage(snapshot);

    this.message = dedent`
      Some conflicts were detected while comparing changes between the snapshot and the target organization.
      Click on the URL below to synchronize your snapshot with your organization before running another push command.
      ${synchronizationPlanUrl}`;

    trySavingDetailedReport(this);
  }
}

export class SnapshotGenericError
  extends SnapshotError
  implements IDetailedReportable
{
  public name = 'Snapshot Error';
  public constructor(
    public snapshot: Snapshot,
    public cfg: Configuration,
    public projectPath?: string
  ) {
    super('error');
    const report = snapshot.latestReport;
    const urlBuilder = new SnapshotUrlBuilder(cfg);
    const snapshotUrl = urlBuilder.getSnapshotPage(snapshot);

    this.message = dedent`Invalid snapshot - ${report.resultCode}.
      You can also use this link to view the snapshot in the Coveo Admin Console
      ${snapshotUrl}`;

    trySavingDetailedReport(this);
  }
}
