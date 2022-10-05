import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
  ResourceSnapshotsReportType,
  SnapshotExportContentFormat,
  ApplyOptionsDeletionScope,
} from '@coveo/platform-client';
import retry from 'async-retry';
import {ReportViewer} from './reportPreviewer/reportPreviewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import {SnapshotReporter} from './snapshotReporter';
import {SnapshotOperationTimeoutError} from '../errors';
import {ExpandedPreviewer} from './expandedPreviewer/expandedPreviewer';
import {Project} from '../project/project';
import {SnapshotNoReportFoundError} from '../errors/snapshotErrors';
import {SnapshotReportStatus} from './reportPreviewer/reportPreviewerDataModels';

export type SnapshotReport = ResourceSnapshotsReportModel;

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
   * Callback to execute every time a request is being made to retrieve the snapshot data
   */
  onRetryCb?: (report: ResourceSnapshotsReportModel) => void;
}

export interface WaitUntilOperationDone extends WaitUntilDoneOptions {
  /**
   * The operation to wait for. If not specified, the method will wait for any operation to complete.
   */
  operationToWaitFor?: ResourceSnapshotsReportType;
}

export class Snapshot {
  public static defaultWaitOptions: Required<WaitUntilDoneOptions> = {
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
    deleteMissingResources = false,
    expandedPreview = true
  ) {
    const reporter = new SnapshotReporter(this.latestReport);
    await this.displayLightPreview(reporter);
    if (!expandedPreview) {
      return;
    }
    const onSuccess = () =>
      this.generateExpandedPreview(projectToPreview, deleteMissingResources);
    await reporter
      .setReportHandler(
        SnapshotReportStatus.SUCCESS,
        async function (this: SnapshotReporter) {
          await onSuccess();
        }
      )
      .handleReport();
  }

  public async apply(
    deleteMissingResources = false,
    options: WaitUntilDoneOptions = {}
  ) {
    await this.snapshotClient.apply(
      this.id,
      deleteMissingResources
        ? {
            deleteMissingResources,
            deletionScope: ApplyOptionsDeletionScope.OnlyTypesFromSnapshot,
          }
        : {deleteMissingResources}
    );

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

  public areResourcesInError() {
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

  public get latestReport() {
    const reports = this.model.reports;
    if (!Array.isArray(reports) || reports.length === 0) {
      throw new SnapshotNoReportFoundError(this);
    }
    return this.sortReportsByDate(reports)[0];
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

  private sortReportsByDate<T extends SnapshotReport>(report: T[]): T[] {
    return report.sort((a, b) => b.updatedDate - a.updatedDate);
  }

  private async displayLightPreview(reporter: SnapshotReporter) {
    const viewer = new ReportViewer(reporter);
    await viewer.display();
  }

  private async generateExpandedPreview(
    projectToPreview: Project,
    shouldDelete: boolean
  ) {
    const previewer = new ExpandedPreviewer(
      this.latestReport,
      this.targetId,
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

  public waitUntilDone(options: WaitUntilOperationDone = {}) {
    const opts = {...Snapshot.defaultWaitOptions, ...options};
    const toMilliseconds = (seconds: number) => seconds * 1e3;

    return retry(
      this.waitUntilDoneRetryFunction(opts.onRetryCb, opts.operationToWaitFor),
      // Setting the retry mechanism to follow a time-based logic instead of specifying the  number of attempts.
      {
        retries: Math.ceil(opts.wait / opts.waitInterval),
        forever: opts.wait === 0,
        minTimeout: toMilliseconds(opts.waitInterval),
        maxTimeout: toMilliseconds(opts.waitInterval),
        maxRetryTime: toMilliseconds(opts.wait),
      }
    );
  }

  private isUnsettled() {
    return Snapshot.ongoingReportStatuses.includes(this.latestReport.status);
  }

  private isGoingThroughOperation(
    operation: ResourceSnapshotsReportType
  ): boolean {
    if (this.latestReport.type === operation) {
      return true;
    }
    return false;
  }

  private waitUntilDoneRetryFunction(
    onRetryCb: (report: ResourceSnapshotsReportModel) => void,
    operationToWaitFor?: ResourceSnapshotsReportType
  ): () => Promise<void> {
    return (async () => {
      await this.refreshSnapshotData();

      const isUnsettled = this.isUnsettled();
      const isUnexpectedOperation = operationToWaitFor
        ? !this.isGoingThroughOperation(operationToWaitFor)
        : false;

      onRetryCb(this.latestReport);

      if (isUnsettled || isUnexpectedOperation) {
        throw new SnapshotOperationTimeoutError(this);
      }
    }).bind(this);
  }
}
