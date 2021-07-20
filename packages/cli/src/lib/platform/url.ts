import {platformUrl, PlatformUrlOptions} from './environment';

export function snapshotUrl(
  targetOrgId: string,
  snapshotId: string,
  options: Partial<PlatformUrlOptions>
) {
  const url = platformUrl(options);
  return `${url}/admin/#${targetOrgId}/organization/resource-snapshots/${snapshotId}`;
}

export function snapshotSynchronizationUrl(
  targetOrgId: string,
  snapshotId: string,
  options: Partial<PlatformUrlOptions>
) {
  const url = snapshotUrl(targetOrgId, snapshotId, options);
  return `${url}/synchronization`;
}
