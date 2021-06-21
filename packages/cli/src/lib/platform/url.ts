import {PlatformEnvironment, platformUrl} from './environment';

export interface SnapshotUrlOptionsArgs {
  environment: Partial<PlatformEnvironment>;
  targetOrgId: string;
  snapshotId: string;
}

export function snapshotUrl(options: SnapshotUrlOptionsArgs) {
  const url = platformUrl({environment: options.environment});
  return `${url}/admin/#${options.targetOrgId}/organization/resource-snapshots/${options.snapshotId}`;
}

export function snapshotSynchronizationUrl(options: SnapshotUrlOptionsArgs) {
  const url = snapshotUrl(options);
  return `${url}/synchronization`;
}
