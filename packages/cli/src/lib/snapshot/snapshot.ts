import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
  ResourceSnapshotsReportType,
  SnapshotExportContentFormat,
  ResourceSnapshotsSynchronizationReportModel,
} from '@coveord/platform-client';
import retry from 'async-retry';
import {ReportViewer} from './reportPreviewer/reportPreviewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import {SnapshotReporter} from './snapshotReporter';
import {SnapshotOperationTimeoutError} from '../errors';
import {ExpandedPreviewer} from './expandedPreviewer/expandedPreviewer';
import {Project} from '../project/project';
import {SynchronizationPlan} from './synchronization/synchronizationPlan';
import {SnapshotSynchronizationReporter} from './synchronization/synchronizationReporter';
import {
  SnapshotNoReportFoundError,
  SnapshotNoSynchronizationReportFoundError,
} from '../errors/snapshotErrors';

export type SnapshotReport =
  | ResourceSnapshotsReportModel
  | ResourceSnapshotsSynchronizationReportModel;

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
    deleteMissingResources = false
  ) {
    this.displayLightPreview();
    const reporter = new SnapshotReporter(this.latestReport);
    if (reporter.isSuccessReport()) {
      await this.generateExpandedPreview(
        projectToPreview,
        deleteMissingResources
      );
    }
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

  public async createSynchronizationPlan(options: WaitUntilDoneOptions = {}) {
    const plan = await this.snapshotClient.createSynchronizationPlan(this.id);

    await this.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.CreateSynchronizationPlan,
      ...options,
    });

    const upToDatePlan = await this.snapshotClient.getSynchronizationPlan(
      this.id,
      plan.id
    );

    return new SynchronizationPlan(upToDatePlan);
  }

  public async applySynchronizationPlan(
    planId: string,
    options: WaitUntilDoneOptions = {}
  ) {
    await this.snapshotClient.applySynchronizationPlan(this.id, planId);

    await this.waitUntilDone({
      operationToWaitFor: ResourceSnapshotsReportType.ApplySynchronizationPlan,
      ...options,
    });

    return new SnapshotSynchronizationReporter(
      this.latestSynchronizationReport
    );
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

  public get latestSynchronizationReport() {
    const reports = this.model.synchronizationReports;
    if (!this.hasBegunSynchronization(reports)) {
      throw new SnapshotNoSynchronizationReportFoundError(this);
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

  private hasBegunSynchronization(
    _synchronizationReports?: ResourceSnapshotsSynchronizationReportModel[]
  ): _synchronizationReports is ResourceSnapshotsSynchronizationReportModel[] {
    const reports = this.model.synchronizationReports || [];
    return reports.length > 0;
  }

  private displayLightPreview() {
    const reporter = new SnapshotReporter(this.latestReport);
    const viewer = new ReportViewer(reporter);
    viewer.display();
  }

  private async generateExpandedPreview(
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

  public waitUntilDone(options: WaitUntilOperationDone = {}) {
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

  private isSynchronizing() {
    if (this.hasBegunSynchronization()) {
      return Snapshot.ongoingReportStatuses?.includes(
        this.latestSynchronizationReport.status
      );
    }
    return false;
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
    if (this.hasBegunSynchronization()) {
      return this.latestSynchronizationReport.type === operation;
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
      const isSynchronizing = this.isSynchronizing();
      const isUnexpectedOperation = operationToWaitFor
        ? !this.isGoingThroughOperation(operationToWaitFor)
        : false;

      onRetryCb(this.latestReport);

      if (isUnsettled || isSynchronizing || isUnexpectedOperation) {
        throw new SnapshotOperationTimeoutError(this);
      }
    }).bind(this);
  }
}
