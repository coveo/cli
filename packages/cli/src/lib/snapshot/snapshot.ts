import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
  ResourceSnapshotsReportType,
  SnapshotExportContentFormat,
} from '@coveord/platform-client';
import {ReportViewer} from './reportViewer/reportViewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import {SnapshotReporter} from './snapshotReporter';
import {SnapshotOperationTimeoutError} from '../errors';

export interface WaitUntilDoneOptions {
  /**
   * The maximum number of seconds to wait before the commands exits with a timeout error.
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

  public async waitUntilDone(
    operationToWaitFor?: ResourceSnapshotsReportType | null,
    options: WaitUntilDoneOptions = {},
    iteratee = (_report: ResourceSnapshotsReportModel) => {}
  ) {
    const toMilliseconds = (seconds: number) => seconds * 1e3;
    const opts = {
      ...Snapshot.defaultWaitOptions,
      ...options,
    };

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const err = new SnapshotOperationTimeoutError(this);
        clearInterval(interval);
        reject(err);
      }, toMilliseconds(opts.wait));

      const interval = setInterval(async () => {
        await this.refreshSnapshotData();

        const isExpectedOperation =
          !operationToWaitFor || this.latestReport.type === operationToWaitFor;

        const isOngoing = Snapshot.ongoingReportStatuses.includes(
          this.latestReport.status
        );

        iteratee(this.latestReport);

        if (!isOngoing && isExpectedOperation) {
          clearTimeout(timeout);
          clearInterval(interval);
          resolve();
        }
      }, toMilliseconds(opts.waitInterval));
    });
  }
}
