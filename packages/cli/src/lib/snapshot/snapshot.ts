import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
} from '@coveord/platform-client';
import ResourceSnapshots from '@coveord/platform-client/dist/definitions/resources/ResourceSnapshots/ResourceSnapshots';
import {cli} from 'cli-ux';
import {backOff} from 'exponential-backoff';

export class Snapshot {
  constructor(
    private model: ResourceSnapshotsModel,
    private client: ResourceSnapshots
  ) {}

  async validate() {
    await this.client.dryRun(this.snapshotId, {
      deleteMissingResources: false, // TODO: CDX-361: Add flag to support missing resources deletion
    });

    await this.waitUntilIdle();
  }

  isValid() {
    const {resultCode, status} = this.lastestReport;
    return (
      status === ResourceSnapshotsReportStatus.Completed &&
      resultCode === ResourceSnapshotsReportResultCode.Success
    );
  }

  async preview() {
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

  get lastestReport(): ResourceSnapshotsReportModel {
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
    this.model = await (this.client.get as any)(this.model.id, {
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
}
