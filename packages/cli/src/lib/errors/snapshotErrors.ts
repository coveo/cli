import {blueBright} from 'chalk';
import {cli} from 'cli-ux';
import dedent from 'ts-dedent';
import {Configuration} from '../config/config';
import {Snapshot} from '../snapshot/snapshot';
import {SnapshotUrlBuilder} from '../snapshot/snapshotUrlBuilder';

enum SeverityLevel {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

interface IDetailedReportable extends SnapshotError {
  snapshot: Snapshot;
  level: SeverityLevel;
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
  public constructor(public level: SeverityLevel) {
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
    super(SeverityLevel.Info);
    this.message = dedent`${
      snapshot.latestReport.type
    } operation is taking a long time to complete.
    Run the following command to monitor the operation:

      ${blueBright`coveo org:config:monitor ${snapshot.id} -t ${snapshot.targetId}`}`;
  }
}

export class SnapshotNoReportFoundError
  extends SnapshotError
  implements IDetailedReportable
{
  public name = 'No Report Found Error';
  public constructor(public snapshot: Snapshot) {
    super(SeverityLevel.Error);
    this.message = dedent`
    No detailed report found for the snapshot ${this.snapshot.id}`;
  }
}
export class SnapshotNoSynchronizationReportFoundError
  extends SnapshotError
  implements IDetailedReportable
{
  public name = 'No Synchronization Report Found Error';
  public constructor(public snapshot: Snapshot) {
    super(SeverityLevel.Error);
    this.message = dedent`
    No synchronization report found for the snapshot ${this.snapshot.id}.
    The snapshot should first be synchronized`;
  }
}

export class SnapshotOperationAbort
  extends SnapshotError
  implements IDetailedReportable
{
  public name = 'Snapshot Operation Aborted';
  public constructor(public snapshot: Snapshot, public cfg: Configuration) {
    super(SeverityLevel.Info);
    this.message = 'Snapshot operation aborted';
    trySavingDetailedReport(this);
  }
}

export class SnapshotSynchronizationAmbiguousMatchesError
  extends SnapshotError
  implements IDetailedReportable
{
  public name = 'Snapshot Ambiguous Synchronization Matches';
  public constructor(public snapshot: Snapshot, public cfg: Configuration) {
    super(SeverityLevel.Warn);
    const urlBuilder = new SnapshotUrlBuilder(cfg);
    const synchronizationPlanUrl = urlBuilder.getSynchronizationPage(snapshot);

    this.message = dedent`
      The snapshot contains unsynchronized resources that cannot be resolved automatically.
      Click on the URL below to manually resolve your snapshot conflicts in the Coveo Admin console.
      ${synchronizationPlanUrl}`;

    trySavingDetailedReport(this);
  }
}

export class SnapshotSynchronizationUnknownError
  extends SnapshotError
  implements IDetailedReportable
{
  public name = 'Snapshot Synchronization Unknown Error';
  public constructor(public snapshot: Snapshot, public cfg: Configuration) {
    super(SeverityLevel.Error);
    const urlBuilder = new SnapshotUrlBuilder(cfg);
    const synchronizationPlanUrl = urlBuilder.getSynchronizationPage(snapshot);

    this.message = dedent`
      The snapshot synchronization has unexpectedly failed.
      Click on the URL below for more info.
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
    super(SeverityLevel.Error);
    const report = snapshot.latestReport;
    const urlBuilder = new SnapshotUrlBuilder(cfg);
    const snapshotUrl = urlBuilder.getSnapshotPage(snapshot);

    this.message = dedent`Invalid snapshot - ${report.resultCode}.
      You can also use this link to view the snapshot in the Coveo Admin Console
      ${snapshotUrl}`;

    trySavingDetailedReport(this);
  }
}
