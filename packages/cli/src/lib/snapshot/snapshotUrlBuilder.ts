import {Configuration} from '../config/config';
import {Snapshot} from './snapshot';
import {
  snapshotSynchronizationUrl,
  snapshotUrl,
  SnapshotUrlOptionsArgs,
} from '../platform/url';

export class SnapshotUrlBuilder {
  public constructor(private config: Configuration) {}

  public getSnapshotPage(snapshot: Snapshot) {
    const options = this.getSnapshotUrlOptions(snapshot);
    return snapshotUrl(options);
  }

  public getSynchronizationPage(snapshot: Snapshot) {
    const options = this.getSnapshotUrlOptions(snapshot);
    return snapshotSynchronizationUrl(options);
  }

  private getSnapshotUrlOptions(snapshot: Snapshot): SnapshotUrlOptionsArgs {
    return {
      environment: this.config.environment,
      targetOrgId: snapshot.targetId,
      snapshotId: snapshot.id,
    };
  }
}
