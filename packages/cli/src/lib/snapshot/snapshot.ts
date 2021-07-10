import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {backOff, IBackOffOptions} from 'exponential-backoff';
import {ReportViewer} from './reportViewer/reportViewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import dedent from 'ts-dedent';
import {SnapshotReporter} from './snapshotReporter';
import {SnapshotOperationTimeoutError} from './snapshotErrors';
import {blueBright} from 'chalk';

export interface waitUntilDoneOptions {
  /**
   * The operation to wait for. If not specified, the method will wait for any operation to complete.
   */
  operationToWaitFor?: ResourceSnapshotsReportType;
  waitOptions?: Partial<IBackOffOptions>;
}

export class Snapshot {
  private static ongoingReportStatuses = [
    ResourceSnapshotsReportStatus.Pending,
    ResourceSnapshotsReportStatus.InProgress,
  ];

  public constructor(
    private model: ResourceSnapshotsModel,
    private client: PlatformClient
  ) {}

  public async validate(
    deleteMissingResources = false
  ): Promise<SnapshotReporter> {
    await this.snapshotClient.dryRun(this.id, {
      deleteMissingResources,
    });

    await this.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.DryRun,
    });

    return new SnapshotReporter(this.latestReport);
  }

  public async preview() {
    this.displayLightPreview();
    this.displayExpandedPreview();
  }

  public async apply(deleteMissingResources = false) {
    await this.snapshotClient.apply(this.id, {deleteMissingResources});

    await this.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.Apply,
    });

    return new SnapshotReporter(this.latestReport);
  }

  public async delete() {
    await this.client.resourceSnapshot.delete(this.model.id);
  }

  public requiresSynchronization() {
    // TODO: backend should provide a specific result code for snapshots that are out of sync with the target org.
    // Waiting for the JIRA number...
    return (
      this.latestReport.resultCode ===
      ResourceSnapshotsReportResultCode.ResourcesInError
    );
  }

  public saveDetailedReport(projectPath: string) {
    const pathToReport = join(
      projectPath,
      'snapshot-reports',
      `${this.latestReport.id}.json`
    );
    ensureFileSync(pathToReport);
    writeJsonSync(pathToReport, this.latestReport, {spaces: 2});
    return pathToReport;
  }

  public get latestReport(): ResourceSnapshotsReportModel {
    if (!Array.isArray(this.model.reports) || this.model.reports.length === 0) {
      throw new Error(`No detailed report found for the snapshot ${this.id}`);
    }
    const sortedReports = this.model.reports.sort(
      (a, b) => b.updatedDate - a.updatedDate
    );
    return sortedReports[0];
  }

  public get id() {
    return this.model.id;
  }

  public get targetId() {
    // TODO: remove after https://github.com/coveo/platform-client/pull/339 is merged
    if (!this.model.targetId) {
      throw new Error(`No target id associated to the snapshot ${this.id}`);
    }
    return this.model.targetId;
  }

  private get snapshotClient() {
    return this.client.resourceSnapshot;
  }

  private displayLightPreview() {
    const reporter = new SnapshotReporter(this.latestReport);
    const viewer = new ReportViewer(reporter);
    viewer.display();
  }

  private displayExpandedPreview() {
    // TODO: CDX-347 Display Expanded preview
  }

  private async refreshSnapshotData() {
    this.model = await this.snapshotClient.get(this.model.id, {
      includeReports: true,
    });
  }

  public async waitUntilDone(
    options: waitUntilDoneOptions = {},
    iteratee = (_report: ResourceSnapshotsReportModel) => {}
  ) {
    const defaultOptions: Partial<IBackOffOptions> = {
      delayFirstAttempt: true,
      startingDelay: 1e3 / 2,
      maxDelay: 2e3,
    };
    const waitPromise = backOff(
      async () => {
        await this.refreshSnapshotData();

        const type = options.operationToWaitFor;
        if (type && this.latestReport.type !== type) {
          throw new Error(dedent`
          Not processing expected operation
          Expected ${type}
          Received ${this.latestReport.type}`);
        }

        const isNotDone = Snapshot.ongoingReportStatuses.includes(
          this.latestReport.status
        );

        if (isNotDone) {
          throw new SnapshotOperationTimeoutError();
        }

        iteratee(this.latestReport);
      },
      {...defaultOptions, ...options.waitOptions}
    );

    try {
      await waitPromise;
    } catch (err) {
      if (err instanceof SnapshotOperationTimeoutError) {
        this.handleOperationTimedOut();
      }
      cli.error(err);
    }
  }

  private handleOperationTimedOut() {
    cli.warn(this.operationGettingTooMuchTimeMessage());
    cli.exit(0);
  }

  private operationGettingTooMuchTimeMessage(): string {
    return dedent`Snapshot ${
      this.latestReport.type
    } operation is taking a long time to complete.
    Run the following command to monitor the operation

    ${blueBright`coveo org:config:monitor ${this.id} -t ${this.model.targetId}`}`;
  }
}
