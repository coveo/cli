import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
  ResourceSnapshotsReportType,
  SnapshotExportContentFormat,
  ApplyOptionsDeletionScope,
  SnapshotDiffModel,
} from '@coveord/platform-client';
import retry from 'async-retry';
import {ReportViewer} from './reportPreviewer/reportPreviewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import {SnapshotReporter} from './snapshotReporter';
import {SnapshotOperationTimeoutError} from '../errors';
import {Project} from '../project/project';
import {SnapshotNoReportFoundError} from '../errors/snapshotErrors';
import {SnapshotDiffReporter} from './diffReporter/diffReporter';
import {CliUx} from '@oclif/core';

export type SnapshotReport = ResourceSnapshotsReportModel | SnapshotDiffModel;

type SnapshotReportTypes = keyof Pick<
  ResourceSnapshotsModel,
  'reports' | 'diffGenerationReports'
>;

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
  onRetryCb?: (report: SnapshotReport) => void;
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
    onRetryCb: (_report: SnapshotReport) => {},
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

  public async diff(project: Project) {
    const numberOfLinesMax = 0; // To always get a downloadable file
    CliUx.ux.action.start('Getting snapshot diff');
    await this.snapshotClient.diff(
      this.id,
      this.latestReport.id,
      numberOfLinesMax
    );
    await this.waitUntilDiffDone();

    const viewer = new SnapshotDiffReporter(
      this.latestDiffReport,
      project.pathToProject
    );
    await viewer.preview();
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
    return this.getLatestReport('reports');
  }

  public get latestDiffReport() {
    return this.getLatestReport('diffGenerationReports');
  }

  public waitUntilDone(options: WaitUntilOperationDone = {}) {
    return this.wait('reports', options);
  }

  public waitUntilDiffDone(options: WaitUntilOperationDone = {}) {
    return this.wait('diffGenerationReports', options);
  }

  private getLatestReport<
    ModelKey extends SnapshotReportTypes = SnapshotReportTypes,
    ReportType extends SnapshotReport = Required<ResourceSnapshotsModel>[ModelKey][0]
  >(reportType: ModelKey): ReportType {
    const reports = this.model[reportType];
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

  private sortReportsByDate<ReportType extends SnapshotReport>(
    report: ReportType[]
  ): ReportType[] {
    return report.sort((a, b) => b.updatedDate - a.updatedDate);
  }

  private async refreshSnapshotData() {
    this.model = await this.snapshotClient.get(this.model.id, {
      includeReports: true,
    });
  }

  private wait(
    reportType: SnapshotReportTypes,
    options: WaitUntilOperationDone
  ) {
    const opts = {...Snapshot.defaultWaitOptions, ...options};
    const toMilliseconds = (seconds: number) => seconds * 1e3;

    return retry(
      this.waitUntilDoneRetryFunction(reportType, opts),
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

  private isUnsettled(report: SnapshotReport) {
    return Snapshot.ongoingReportStatuses.includes(report.status);
  }

  private isGoingThroughOperation(
    reportType: SnapshotReportTypes,
    operation: ResourceSnapshotsReportType
  ): boolean {
    // TODO: CDX-949: Use the actual operation progress state from the API
    const report = this.getLatestReport(reportType);
    if ('type' in report && report.type === operation) {
      return true;
    }
    return false;
  }

  private waitUntilDoneRetryFunction(
    reportType: SnapshotReportTypes,
    options: WaitUntilOperationDone
  ): () => Promise<void> {
    return (async () => {
      await this.refreshSnapshotData();
      const report = this.getLatestReport(reportType);
      const isUnsettled = this.isUnsettled(report);
      const isUnexpectedOperation = options.operationToWaitFor
        ? !this.isGoingThroughOperation(reportType, options.operationToWaitFor)
        : false;

      options.onRetryCb && options.onRetryCb(report);

      if (isUnsettled || isUnexpectedOperation) {
        throw new SnapshotOperationTimeoutError(this);
      }
    }).bind(this);
  }
}
