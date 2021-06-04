import {
  ResourceSnapshotsModel,
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  PlatformClient,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {backOff} from 'exponential-backoff';
import {SynchronizationPlan} from './synchronizationPlan';

export interface ISnapshotValidation {
  isValid: boolean;
  report: ResourceSnapshotsReportModel;
}

export class Snapshot {
  public constructor(
    private model: ResourceSnapshotsModel,
    private client: PlatformClient
  ) {}

  public async validate(): Promise<ISnapshotValidation> {
    await this.snapshotClient.dryRun(this.snapshotId, {
      deleteMissingResources: false, // TODO: CDX-361: Add flag to support missing resources deletion
    });

    await this.waitUntilDone();

    return {isValid: this.isValid(), report: this.latestReport};
  }

  public async createSynchronizationPlan() {
    const model = await this.client.resourceSnapshot.createSynchronizationPlan(
      this.model.id
    );

    const plan = new SynchronizationPlan(model, this.client);
    await plan.waitUntilDone();
  }

  public async preview() {
    // TODO: get detailed report
    this.displayLightPreview();
    this.displayExpandedPreview();
  }

  public async delete() {
    await this.client.resourceSnapshot.delete(this.model.id);
  }

  public get latestReport(): ResourceSnapshotsReportModel {
    if (this.model.reports === undefined || this.model.reports.length === 0) {
      throw new Error(
        `No detailed report found for the snapshot ${this.snapshotId}`
      );
    }
    return this.model.reports.slice(-1)[0];
  }

  private get snapshotId() {
    return this.model.id;
  }

  private get snapshotClient() {
    return this.client.resourceSnapshot;
  }

  private displayLightPreview() {
    // TODO: CDX-346 Display light preview
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

  private async waitUntilDone() {
    const waitPromise = backOff(
      async () => {
        await this.refreshSnapshotData();

        const isNotDone = [
          ResourceSnapshotsReportStatus.Pending,
          ResourceSnapshotsReportStatus.InProgress,
        ].includes(this.latestReport.status);

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
