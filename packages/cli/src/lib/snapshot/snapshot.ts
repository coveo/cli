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
import {ReportViewer} from './reportViewer';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {join} from 'path';
import dedent from 'ts-dedent';
import {ExpandedPreviewer} from './expandedPreviewer';

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

  public async validate(): Promise<ISnapshotValidation> {
    await this.snapshotClient.dryRun(this.id, {
      deleteMissingResources: false, // TODO: CDX-361: Add flag to support missing resources deletion
    });

    await this.waitUntilOperationIsDone(ResourceSnapshotsReportType.DryRun);

    return {isValid: this.isValid(), report: this.latestReport};
  }

  public async preview(resourceDirectoryPath: string) {
    this.displayLightPreview();
    await this.displayExpandedPreview(resourceDirectoryPath);
  }

  public async delete() {
    await this.client.resourceSnapshot.delete(this.model.id);
  }

  public async downloadZip(downloadPath: string) {
    throw new Error('Method not implemented.');
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
    const report = new ReportViewer(this.latestReport);
    report.display();
  }

  private async displayExpandedPreview(resourceDirectoryPath: string) {
    const previewer = new ExpandedPreviewer(
      this.latestReport,
      this.targetId!,
      resourceDirectoryPath
    );
    await previewer.preview();
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
