import {cli} from 'cli-ux';
import dedent from 'ts-dedent';
import {Configuration} from '../config/config';
import {Snapshot} from '../snapshot/snapshot';
import {SnapshotUrlBuilder} from '../snapshot/snapshotUrlBuilder';
import colors from '../utils/color-utils';
import {PrintableError, SeverityLevel} from './printableError';

interface DetailedReportable extends PrintableError {
  snapshot: Snapshot;
  projectPath?: string;
}

function trySavingDetailedReport(error: DetailedReportable) {
  if (error.projectPath) {
    const reportPath = error.snapshot.saveDetailedReport(error.projectPath);
    error.message += dedent`\n\n
          Detailed report saved at ${reportPath}`;
  }
}

function printMessageWithSynchronizationPlanUrl(
  message: string,
  snapshot: Snapshot,
  cfg: Configuration
) {
  const urlBuilder = new SnapshotUrlBuilder(cfg);
  const synchronizationPlanUrl = urlBuilder.getSynchronizationPage(snapshot);
  cli.log(dedent`${message}
  ${synchronizationPlanUrl}`);
}

export class SnapshotOperationTimeoutError
  extends PrintableError
  implements DetailedReportable
{
  public name = 'Snapshot Operation Timeout Error';
  public constructor(public snapshot: Snapshot) {
    super(SeverityLevel.Info);
    this.message = dedent`${
      snapshot.latestReport.type
    } operation is taking a long time to complete.
    Run the following command to monitor the operation:

      ${colors.cmd`coveo org:resources:monitor ${snapshot.id} -t ${snapshot.targetId}`}`;
  }
}

export class SnapshotNoReportFoundError
  extends PrintableError
  implements DetailedReportable
{
  public name = 'No Report Found Error';
  public constructor(public snapshot: Snapshot) {
    super(SeverityLevel.Error);
    this.message = dedent`
    No detailed report found for the snapshot ${this.snapshot.id}`;
  }
}

export class SnapshotNoSynchronizationReportFoundError
  extends PrintableError
  implements DetailedReportable
{
  public name = 'No Synchronization Report Found Error';
  public constructor(public snapshot: Snapshot) {
    super(SeverityLevel.Error);
    this.message = dedent`
    No synchronization report found for the snapshot ${this.snapshot.id}.
    The snapshot should first be synchronized.`;
  }
}

export class SnapshotOperationAbort
  extends PrintableError
  implements DetailedReportable
{
  public name = 'Snapshot Operation Aborted';
  public constructor(public snapshot: Snapshot, public cfg: Configuration) {
    super(SeverityLevel.Info);
    this.message = 'Snapshot operation aborted';
    trySavingDetailedReport(this);
  }
}

export class SnapshotSynchronizationAmbiguousMatchesError
  extends PrintableError
  implements DetailedReportable
{
  public name = 'Snapshot Ambiguous Synchronization Matches';
  public constructor(public snapshot: Snapshot, public cfg: Configuration) {
    super(SeverityLevel.Info);
    this.message = dedent`
      The snapshot contains unsynchronized resources that cannot be resolved automatically.`;

    trySavingDetailedReport(this);
  }

  public print() {
    super.print();
    printMessageWithSynchronizationPlanUrl(
      'Click on the URL below to manually resolve your snapshot conflicts.',
      this.snapshot,
      this.cfg
    );
  }
}

export class SnapshotSynchronizationUnknownError
  extends PrintableError
  implements DetailedReportable
{
  public name = 'Snapshot Synchronization Unknown Error';
  public constructor(public snapshot: Snapshot, public cfg: Configuration) {
    super(SeverityLevel.Error);
    this.message = dedent`
      The snapshot synchronization has unexpectedly failed.`;

    trySavingDetailedReport(this);
  }

  public print() {
    super.print();
    printMessageWithSynchronizationPlanUrl(
      'Click on the URL below for more information.',
      this.snapshot,
      this.cfg
    );
  }
}

export class SnapshotGenericError
  extends PrintableError
  implements DetailedReportable
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
