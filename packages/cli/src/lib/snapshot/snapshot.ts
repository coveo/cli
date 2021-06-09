import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {backOff} from 'exponential-backoff';
import {ReportViewer} from './reportViewer';

export interface ISnapshotValidation {
  isValid: boolean;
  report: ResourceSnapshotsReportModel;
}

export class Snapshot {
  constructor(
    private model: ResourceSnapshotsModel,
    private client: PlatformClient
  ) {}

  public async validate(): Promise<ISnapshotValidation> {
    await this.snapshotClient.dryRun(this.snapshotId, {
      deleteMissingResources: false, // TODO: CDX-361: Add flag to support missing resources deletion
    });

    await this.waitUntilIdle();

    return {isValid: this.isValid(), report: this.latestReport};
  }

  public async preview() {
    this.displayLightPreview();
    this.displayExpandedPreview();
  }

  public async delete() {
    // TODO: CDX-359: Delete snapshot once previewed
  }

  private get snapshotId() {
    return this.model.id;
  }

  private get snapshotClient() {
    return this.client.resourceSnapshot;
  }

  private displayLightPreview() {
    const report = new ReportViewer(this.latestReport);
    report.view();
  }

  private displayExpandedPreview() {
    // TODO: CDX-347 Display Expanded preview
  }

  private get latestReport(): ResourceSnapshotsReportModel {
    if (this.model.reports === undefined) {
      throw new Error(
        `No detailed report found for the snapshot ${this.snapshotId}`
      );
    }
    const sortedReports = this.model.reports.sort(
      (a, b) => b.updatedDate - a.updatedDate
    );
    return sortedReports[0];
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

  private async isIdle() {
    await this.refreshSnapshotData();
    return new Promise<void>((resolve, reject) => {
      if (
        [
          ResourceSnapshotsReportStatus.Aborted,
          ResourceSnapshotsReportStatus.Completed,
        ].includes(this.latestReport.status)
      ) {
        resolve();
      } else {
        reject();
      }
    });
  }

  private async waitUntilIdle() {
    try {
      await backOff(() => this.isIdle(), {
        delayFirstAttempt: true,
        startingDelay: 1e3 / 2,
        maxDelay: 2e3,
      });
    } catch (err) {
      cli.error(err);
    }
  }
}
