import {platformUrl, PlatformUrlOptions} from './environment';

export function adminUiUrl(options: Partial<PlatformUrlOptions>) {
  const baseUrl = platformUrl(options);
  return `${baseUrl}/admin/#`;
}

export function snapshotUrl(
  targetOrgId: string,
  snapshotId: string,
  options: Partial<PlatformUrlOptions>
) {
  const baseUrl = adminUiUrl(options);
  return `${baseUrl}/${targetOrgId}/organization/resource-snapshots/${snapshotId}`;
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
  const baseUrl = adminUiUrl(options);
  return `${baseUrl}/${targetOrgId}/organization/resource-snapshots/create-snapshot`;
}
