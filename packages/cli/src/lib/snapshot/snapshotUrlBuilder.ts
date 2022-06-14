import {Configuration} from '../config/config.js';
import {Snapshot} from './snapshot.js';
import {snapshotSynchronizationUrl, snapshotApplyUrl} from '../platform/url.js';
import {PlatformUrlOptions} from '../platform/environment.js';

export class SnapshotUrlBuilder {
  public constructor(private config: Configuration) {}

  public getSnapshotApplyPage(snapshot: Snapshot) {
    const {options, targetOrgId, snapshotId} =
      this.getSnapshotUrlOptions(snapshot);
    return snapshotApplyUrl(targetOrgId, snapshotId, options);
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
