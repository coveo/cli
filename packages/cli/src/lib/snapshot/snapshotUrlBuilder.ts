import {Configuration} from '../config/config';
import {Snapshot} from './snapshot';
import {snapshotSynchronizationUrl, snapshotUrl} from '../platform/url';
import {PlatformUrlOptions} from '../platform/environment';

export class SnapshotUrlBuilder {
  public constructor(private config: Configuration) {}

  public getSnapshotPage(snapshot: Snapshot) {
    const {options, targetOrgId, snapshotId} =
      this.getSnapshotUrlOptions(snapshot);
    return snapshotUrl(targetOrgId, snapshotId, options);
  }

  public getSynchronizationPage(snapshot: Snapshot) {
    const {options, targetOrgId, snapshotId} =
      this.getSnapshotUrlOptions(snapshot);
    return snapshotSynchronizationUrl(targetOrgId, snapshotId, options);
  }

  private getSnapshotUrlOptions(snapshot: Snapshot) {
    const platformUrlOptions: PlatformUrlOptions = {
      environment: this.config.environment,
      region: this.config.region,
    };
    return {
      options: platformUrlOptions,
      targetOrgId: snapshot.targetId,
      snapshotId: snapshot.id,
    };
  }
}
