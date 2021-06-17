import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {backOff} from 'exponential-backoff';
import {ReportViewer} from './reportViewer/reportViewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import dedent from 'ts-dedent';

export interface ISnapshotValidation {
  isValid: boolean;
  report: ResourceSnapshotsReportModel;
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
  ): Promise<ISnapshotValidation> {
    await this.snapshotClient.dryRun(this.id, {
      deleteMissingResources,
    });

    await this.waitUntilOperationIsDone(ResourceSnapshotsReportType.DryRun);

    return {isValid: this.isValid(), report: this.latestReport};
  }

  public async preview() {
    this.displayLightPreview();
    this.displayExpandedPreview();
  }

  public hasChangedResources(): boolean {
    // TODO: CDX-390: Do not propose to apply a snapshot if it contains no changes
    return true;
  }

  public async apply(deleteMissingResources = false) {
    await this.snapshotClient.apply(this.id, {deleteMissingResources});

    await this.waitUntilOperationIsDone(ResourceSnapshotsReportType.Apply);

    return {isValid: this.isValid(), report: this.latestReport};
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
    const report = new ReportViewer(this.latestReport);
    report.display();
  }

  private displayExpandedPreview() {
    // TODO: CDX-347 Display Expanded preview
  }

  private isValid() {
    const {resultCode, status} = this.latestReport;
    return (
      status === ResourceSnapshotsReportStatus.Completed &&
      resultCode === ResourceSnapshotsReportResultCode.Success
    );
  }

  private async refreshSnapshotData() {
    this.model = await this.snapshotClient.get(this.model.id, {
      includeReports: true,
    });
  }

  public async waitUntilOperationIsDone(
    operationType: ResourceSnapshotsReportType
  ) {
    const waitPromise = backOff(
      async () => {
        await this.refreshSnapshotData();

        if (this.latestReport.type !== operationType) {
          throw new Error(dedent`
          Not processing expected operation
          Expected ${operationType}
          Received ${this.latestReport.type}`);
        }

        const isNotDone = Snapshot.ongoingReportStatuses.includes(
          this.latestReport.status
        );

        if (isNotDone) {
          throw new Error('Snapshot is still being processed');
        }
      },
      {
        delayFirstAttempt: true,
        startingDelay: 1e3 / 2,
        maxDelay: 2e3,
      }
    );

    try {
      await waitPromise;
    } catch (err) {
      cli.error(err);
    }
  }
}
