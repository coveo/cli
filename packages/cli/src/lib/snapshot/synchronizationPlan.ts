import {
  PlatformClient,
  ResourceSnapshotsSynchronizationPlanModel,
  ResourceSnapshotsSynchronizationPlanStatus,
} from '@coveord/platform-client';
import {cli} from 'cli-ux';
import {backOff} from 'exponential-backoff';

export class SynchronizationPlan {
  public constructor(
    private model: ResourceSnapshotsSynchronizationPlanModel,
    private client: PlatformClient
  ) {}

  public async waitUntilDone() {
    const waitPromise = backOff(
      async () => {
        await this.refreshPlan();

        const isNotDone = [
          ResourceSnapshotsSynchronizationPlanStatus.Creating,
        ].includes(this.model.status);

        if (isNotDone) {
          throw new Error('Synchronization is not over');
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

  private get snapshotClient() {
    return this.client.resourceSnapshot;
  }

  private async refreshPlan() {
    const {snapshotId, id} = this.model;

    this.model = await this.snapshotClient.getSynchronizationPlan(
      snapshotId,
      id
    );
  }
}
