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
import {ReportViewer} from './reportPreviewer/reportPreviewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import {SnapshotReporter} from './snapshotReporter';
import {SnapshotOperationTimeoutError} from '../errors';
import {ExpandedPreviewer} from './expandedPreviewer/expandedPreviewer';
import {Project} from '../project/project';

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
  /**
   * The operation to wait for. If not specified, the method will wait for any operation to complete.
   */
  operationToWaitFor?: ResourceSnapshotsReportType;
  /**
   * Callback to execute every time a request is being made to retrieve the snapshot data
   */
  onRetryCb?: (report: ResourceSnapshotsReportModel) => void;
}

export class Snapshot {
  public static defaultWaitOptions: Required<
    Omit<WaitUntilDoneOptions, 'operationToWaitFor'>
  > = {
    waitInterval: 1,
    wait: 60,
    onRetryCb: (_report: ResourceSnapshotsReportModel) => {},
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
    deleteMissingResources = false,
    options: WaitUntilDoneOptions = {}
  ): Promise<SnapshotReporter> {
    await this.snapshotClient.dryRun(this.id, {
      deleteMissingResources,
    });

    await this.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.DryRun,
      ...options,
    });

    return new SnapshotReporter(this.latestReport);
  }

  public async preview(
    projectToPreview: Project,
    deleteMissingResources = false
  ) {
    this.displayLightPreview();
    await this.displayExpandedPreview(projectToPreview, deleteMissingResources);
  }

  public async apply(
    deleteMissingResources = false,
    options: WaitUntilDoneOptions = {}
  ) {
    await this.snapshotClient.apply(this.id, {deleteMissingResources});

    await this.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.Apply,
      ...options,
    });

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

  private async displayExpandedPreview(
    projectToPreview: Project,
    shouldDelete: boolean
  ) {
    const previewer = new ExpandedPreviewer(
      this.latestReport,
      this.targetId!,
      projectToPreview,
      shouldDelete
    );
    await previewer.preview();
  }

  private async refreshSnapshotData() {
    this.model = await this.snapshotClient.get(this.model.id, {
      includeReports: true,
    });
  }

  public waitUntilDone(options: WaitUntilDoneOptions = {}) {
    const opts = {...Snapshot.defaultWaitOptions, ...options};
    const toMilliseconds = (seconds: number) => seconds * 1e3;

    return retry(
      this.waitUntilDoneRetryFunction(opts.onRetryCb, opts.operationToWaitFor),
      // Setting the retry mechanism to follow a time-based logic instead of specifying the  number of attempts.
      {
        retries: Math.ceil(opts.wait / opts.waitInterval),
        minTimeout: toMilliseconds(opts.waitInterval),
        maxTimeout: toMilliseconds(opts.waitInterval),
        maxRetryTime: toMilliseconds(opts.wait),
      }
    );
  }

  private waitUntilDoneRetryFunction(
    onRetryCb: (report: ResourceSnapshotsReportModel) => void,
    operationToWaitFor?: ResourceSnapshotsReportType
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
    }).bind(this);
  }
}
