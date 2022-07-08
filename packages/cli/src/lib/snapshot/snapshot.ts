import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
  ResourceSnapshotsReportType,
  SnapshotExportContentFormat,
  ResourceSnapshotsSynchronizationReportModel,
  ApplyOptionsDeletionScope,
  SnapshotDiffModel,
} from '@coveord/platform-client';
import retry from 'async-retry';
import {ReportViewer} from './reportPreviewer/reportPreviewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import {SnapshotReporter} from './snapshotReporter';
import {SnapshotOperationTimeoutError} from '../errors';
import {ExpandedPreviewer} from './expandedPreviewer/expandedPreviewer';
import {Project} from '../project/project';
import {
  SnapshotNoReportFoundError,
  SnapshotNoSynchronizationReportFoundError,
} from '../errors/snapshotErrors';
import {DiffViewer} from './diffViewer/diffViewer';
import {PrintableError} from '../errors/printableError';

export type SnapshotReport =
  | ResourceSnapshotsReportModel
  | ResourceSnapshotsSynchronizationReportModel
  | SnapshotDiffModel;

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

  public async preview() {
    const reporter = new SnapshotReporter(this.latestReport);
    const viewer = new ReportViewer(reporter);
    await viewer.display();
  }

  // public async diff(projectToPreview: Project) {
  //   // const reporter = new SnapshotReporter(this.latestDiffReport);
  //   // const viewer = new ReportViewer(reporter);
  //   const diffModel = await this.snapshotClient.diff(
  //     this.id,
  //     this.getLatestReport.id
  //   );
  //   await this.waitUntilDone({
  //     operationToWaitFor: ResourceSnapshotsReportType.DryRun,
  //     ...options,
  //   });

  //   const previewer = new DiffViewer(diffModel, projectToPreview);
  //   await previewer.diff();
  // }

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
    return this.getLatestReport<ResourceSnapshotsReportModel>('reports');
  }

  public get latestSynchronizationReport() {
    return this.getLatestReport<ResourceSnapshotsSynchronizationReportModel>(
      'synchronizationReports'
    );
  }

  public get latestDiffReport() {
    return this.getLatestReport<SnapshotDiffModel>('diffGenerationReports');
  }

  private getLatestReport<T extends SnapshotReport>(
    reportType: keyof Pick<
      ResourceSnapshotsModel,
      'reports' | 'synchronizationReports' | 'diffGenerationReports'
    >
  ): T {
    const reports = this.model[reportType];
    if (!Array.isArray(reports) || reports.length === 0) {
      throw new SnapshotNoReportFoundError(this);
    }
    return this.sortReportsByDate<T>(reports)[0];
  }

  private sortReportsByDate<T extends {updatedDate: number}>(report: T[]): T[] {
    return report.sort((a, b) => b.updatedDate - a.updatedDate);
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

  private hasBegunSynchronization(
    _synchronizationReports?: ResourceSnapshotsSynchronizationReportModel[]
  ): _synchronizationReports is ResourceSnapshotsSynchronizationReportModel[] {
    const reports = this.model.synchronizationReports || [];
    return reports.length > 0;
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
      this.waitUntilDoneRetryFunction(opts.operationToWaitFor),
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
    // TODO: CDX-949: Use the actual operation progress state from the API
    if (this.latestReport.type === operation) {
      return true;
    }
    if (this.hasBegunSynchronization()) {
      return this.latestSynchronizationReport.type === operation;
    }
    return false;
  }

  private waitUntilDoneRetryFunction(
    operationToWaitFor?: ResourceSnapshotsReportType
  ): () => Promise<void> {
    return (async () => {
      await this.refreshSnapshotData();

      // TODO: CDX-949: Check the report.progressValue instead of running some assumptions
      const isUnsettled = this.isUnsettled();
      const isSynchronizing = this.isSynchronizing();
      const isUnexpectedOperation = operationToWaitFor
        ? !this.isGoingThroughOperation(operationToWaitFor)
        : false;

      if (isUnsettled || isSynchronizing || isUnexpectedOperation) {
        throw new SnapshotOperationTimeoutError(this);
      }
    }).bind(this);
  }
}
