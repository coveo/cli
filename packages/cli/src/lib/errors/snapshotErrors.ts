import {blueBright} from 'chalk';
import dedent from 'ts-dedent';
import {Configuration} from '../config/config';
import {Snapshot} from '../snapshot/snapshot';
import {SnapshotUrlBuilder} from '../snapshot/snapshotUrlBuilder';

export class SnapshotOperationTimeoutError extends Error {
  public name = 'Snapshot Operation Timeout Error';
  public constructor(public snapshot: Snapshot) {
    super();
    this.message = dedent`${
      snapshot.latestReport.type
    } operation is taking a long time to complete.
    Run the following command to monitor the operation:

      ${blueBright`coveo org:config:monitor ${snapshot.id} -t ${snapshot.targetId}`}`;
  }
}

export class SnapshotSynchronizationError extends Error {
  public name = 'Snapshot Synchronization Error';
  public constructor(
    public snapshot: Snapshot,
    public cfg: Configuration,
    public projectPath?: string
  ) {
    super();
    const urlBuilder = new SnapshotUrlBuilder(cfg);
    const synchronizationPlanUrl = urlBuilder.getSynchronizationPage(snapshot);

    this.message = dedent`
      Some conflicts were detected while comparing changes between the snapshot and the target organization.
      Click on the URL below to synchronize your snapshot with your organization before running another push command.
      ${synchronizationPlanUrl}`;

    if (projectPath) {
      const reportPath = snapshot.saveDetailedReport(projectPath);
      this.message += dedent`\n\n
        Detailed report saved at ${reportPath}`;
    }
  }
}

export class SnapshotGenericError extends Error {
  public name = 'Snapshot Error';
  public constructor(
    public snapshot: Snapshot,
    public cfg: Configuration,
    public projectPath?: string
  ) {
    super();
    const report = snapshot.latestReport;
    const urlBuilder = new SnapshotUrlBuilder(cfg);
    const snapshotUrl = urlBuilder.getSnapshotPage(snapshot);

    this.message = dedent`Invalid snapshot - ${report.resultCode}.
      You can also use this link to view the snapshot in the Coveo Admin Console
      ${snapshotUrl}`;

    if (projectPath) {
      const reportPath = snapshot.saveDetailedReport(projectPath);
      this.message += dedent`\n\n
          Detailed report saved at ${reportPath}`;
    }
  }
}
