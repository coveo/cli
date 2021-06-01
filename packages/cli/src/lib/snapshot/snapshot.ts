import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {backOff} from 'exponential-backoff';

export class Snapshot {
  constructor(
    private model: ResourceSnapshotsModel,
    private client: PlatformClient
  ) {}

  public async validate() {
    await this.snapshotClient.dryRun(this.snapshotId, {
      deleteMissingResources: false, // TODO: CDX-361: Add flag to support missing resources deletion
    });

    await this.waitUntilIdle();
  }

  public isValid() {
    const {resultCode, status} = this.lastestReport;
    return (
      status === ResourceSnapshotsReportStatus.Completed &&
      resultCode === ResourceSnapshotsReportResultCode.Success
    );
  }

  public async preview() {
    // TODO: get detailed report
    this.displayLightPreview();
    this.displayExpandedPreview();
  }

  private displayLightPreview() {
    // TODO: CDX-346 Display light preview
  }

  private displayExpandedPreview() {
    // TODO: CDX-347 Display Expanded preview
  }

  async delete() {
    // TODO: CDX-359: Delete snapshot once previewed
  }

  public get lastestReport(): ResourceSnapshotsReportModel {
    if (this.model.reports === undefined) {
      throw new Error(
        `No detailed report found for the snapshot ${this.snapshotId}`
      );
    }
    return this.model.reports.slice(-1)[0];
  }

  private get snapshotId() {
    return this.model.id;
  }

  private async refreshSnapshotData() {
    this.model = await this.snapshotClient.get(this.model.id, {
      includeReports: false,
    });
  }

  private async isIdle() {
    await this.refreshSnapshotData();
    return new Promise<void>((resolve) => {
      if (
        [
          ResourceSnapshotsReportStatus.Aborted,
          ResourceSnapshotsReportStatus.Completed,
        ].includes(this.lastestReport.status)
      ) {
        resolve();
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

  private get snapshotClient() {
    return this.client.resourceSnapshot;
  }
}
