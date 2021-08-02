import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
  ResourceSnapshotsReportType,
  SnapshotExportContentFormat,
} from '@coveord/platform-client';
import retry from 'async-retry';
import {ReportViewer} from './reportViewer/reportViewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import {SnapshotReporter} from './snapshotReporter';
import {SnapshotOperationTimeoutError} from '../errors';

export interface WaitUntilDoneOptions {
  /**
   * The maximum number of seconds to wait before the commands exits with a timeout error.
   * A value of zero will prevent the command from timing out.
   */
  wait?: number; // in seconds
  /**
   * The interval between 2 consecutive polls.
   */
  waitInterval?: number; // in seconds
}

export class Snapshot {
  public static defaultWaitOptions: Required<WaitUntilDoneOptions> = {
    waitInterval: 1,
    wait: 60,
  };

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

    await this.waitUntilDone(ResourceSnapshotsReportType.DryRun);

    return new SnapshotReporter(this.latestReport);
  }

  public async preview() {
    this.displayLightPreview();
    this.displayExpandedPreview();
  }

  public async apply(deleteMissingResources = false) {
    await this.snapshotClient.apply(this.id, {deleteMissingResources});

    await this.waitUntilDone(ResourceSnapshotsReportType.Apply);

    return new SnapshotReporter(this.latestReport);
  }

  public async delete() {
    await this.client.resourceSnapshot.delete(this.model.id);
  }

  public download() {
    return this.client.resourceSnapshot.export(this.id, {
      contentFormat: SnapshotExportContentFormat.SplitPerType,
    });
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

  public waitUntilDone(
    operationToWaitFor: ResourceSnapshotsReportType | null,
    options: Partial<WaitUntilDoneOptions> = {},
    onRetryCb = (_report: ResourceSnapshotsReportModel) => {}
  ) {
    const opts = {...Snapshot.defaultWaitOptions, options};
    const toMilliseconds = (seconds: number) => seconds * 1e3;

    return retry(
      this.waitUntilDoneRetryFunction(operationToWaitFor, onRetryCb),
      {
        retries: Infinity,
        minTimeout: toMilliseconds(opts.waitInterval),
        maxTimeout: toMilliseconds(opts.waitInterval),
        maxRetryTime: options.wait,
      }
    );
  }

  private waitUntilDoneRetryFunction(
    operationToWaitFor: ResourceSnapshotsReportType | null,
    onRetryCb: (report: ResourceSnapshotsReportModel) => void
  ): () => Promise<void> {
    return (async () => {
      await this.refreshSnapshotData();

      const isExpectedOperation =
        !operationToWaitFor || this.latestReport.type === operationToWaitFor;

      const isOngoing = Snapshot.ongoingReportStatuses.includes(
        this.latestReport.status
      );

      onRetryCb(this.latestReport);

      if (isOngoing || !isExpectedOperation) {
        throw new SnapshotOperationTimeoutError(this);
      }
      return;
    }).bind(this);
  }
}
