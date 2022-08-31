import {platformUrl, PlatformUrlOptions} from './environment';

export function snapshotUrl(
  targetOrgId: string,
  snapshotId: string,
  options: Partial<PlatformUrlOptions>
) {
  const url = platformUrl(options);
  return `${url}/admin/#${targetOrgId}/organization/resource-snapshots/${snapshotId}`;
}

export function snapshotApplyUrl(
  targetOrgId: string,
  snapshotId: string,
  options: Partial<PlatformUrlOptions>
) {
  const url = snapshotUrl(targetOrgId, snapshotId, options);
  return `${url}/apply`;
}

export function createSnapshotUrl(
  targetOrgId: string,
  options: Partial<PlatformUrlOptions>
) {
  const url = platformUrl(options);
  return `${url}/admin/#${targetOrgId}/organization/resource-snapshots/create-snapshot`;
}