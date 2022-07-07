import {Configuration} from '../config/config';
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

export function createSnapshotUrl(
  targetOrgId: string,
  options: Partial<PlatformUrlOptions>
) {
  const url = platformUrl(options);
  return `${url}/admin/#${targetOrgId}/organization/resource-snapshots/create-snapshot`;
}

export function catalogConfigurationUrl(
  catalogConfigurationId: string,
  options: Configuration
) {
  const url = platformUrl(options);
  return `${url}/admin/#${options.organization}/commerce/configurations/edit/${catalogConfigurationId}`;
}
