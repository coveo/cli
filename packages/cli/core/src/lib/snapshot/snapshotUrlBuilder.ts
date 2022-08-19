import {Configuration} from '@coveo/cli-commons/lib/config/config';
import {Snapshot} from './snapshot';
import {snapshotApplyUrl} from '@coveo/cli-commons/lib/platform/url';
import {PlatformUrlOptions} from '@coveo/cli-commons/lib/platform/environment';

export class SnapshotUrlBuilder {
  public constructor(private config: Configuration) {}

  public getSnapshotApplyPage(snapshot: Snapshot) {
    const {options, targetOrgId, snapshotId} =
      this.getSnapshotUrlOptions(snapshot);
    return snapshotApplyUrl(targetOrgId, snapshotId, options);
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
