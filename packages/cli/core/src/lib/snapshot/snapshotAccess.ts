import {startSpinner} from '@coveo/cli-commons/utils/ux';
import PlatformClient, {
  ResourceSnapshotType,
  SnapshotAccessType,
} from '@coveord/platform-client';
import {
  MissingResourcePrivileges,
  MissingSnapshotPrivilege,
} from '../errors/snapshotErrors';
import {isSubset, without} from '../utils/list';

export async function ensureResourceAccess(
  client: PlatformClient,
  resourceTypes: ResourceSnapshotType[],
  snapshotAccessType: SnapshotAccessType = SnapshotAccessType.Read
) {
  startSpinner('Validating resource access');
  const allowedResources = await client.resourceSnapshot.listResourceAccess();
  const allowed = isSubset(resourceTypes, allowedResources);
  if (!allowed) {
    const missingResources = without(resourceTypes, allowedResources);
    throw new MissingResourcePrivileges(missingResources, snapshotAccessType);
  }
}

export async function ensureSnapshotAccess(
  client: PlatformClient,
  snapshotId: string,
  snapshotAccessType: SnapshotAccessType = SnapshotAccessType.Read
) {
  startSpinner('Validating snapshot access');
  const {allowed} = await client.resourceSnapshot.validateAccess(snapshotId, {
    snapshotAccessType,
  });

  if (!allowed) {
    throw new MissingSnapshotPrivilege(snapshotId, snapshotAccessType);
  }
}
