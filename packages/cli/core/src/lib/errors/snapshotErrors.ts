import {blueBright} from 'chalk';
import dedent from 'ts-dedent';
import {Configuration} from '@coveo/cli-commons/src/config/config';
import {Snapshot} from '../snapshot/snapshot';
import {SnapshotUrlBuilder} from '../snapshot/snapshotUrlBuilder';
import {
  PrintableError,
  SeverityLevel,
} from '@coveo/cli-commons/src/errors/printableError';

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

      ${blueBright`coveo org:resources:monitor ${snapshot.id} -t ${snapshot.targetId}`}`;
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
    const snapshotUrl = urlBuilder.getSnapshotApplyPage(snapshot);

    this.message = dedent`Invalid snapshot - ${report.resultCode}.
      You can also use this link to view the snapshot in the Coveo Admin Console
      ${snapshotUrl}`;

    trySavingDetailedReport(this);
  }
}
export class SnapshotMissingVaultEntriesError
  extends PrintableError
  implements DetailedReportable
{
  public name = 'Snapshot Missing Vault Entries';
  public constructor(
    public snapshot: Snapshot,
    public cfg: Configuration,
    public projectPath?: string
  ) {
    super(SeverityLevel.Error);
    this.message = dedent`Your destination organization is missing vault entries needed by the snapshot ${snapshot.id}.
      Ensure that all vault entries are present on the organization ${snapshot.targetId} and try again.
      Visit https://docs.coveo.com/en/m3a90243 for more info on how to create vault entries.`;

    trySavingDetailedReport(this);
  }
}
