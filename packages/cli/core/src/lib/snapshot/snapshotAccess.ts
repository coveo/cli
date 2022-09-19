import {starSpinner} from '@coveo/cli-commons/utils/ux';
import PlatformClient, {
  ResourceSnapshotType,
  SnapshotAccessType,
} from '@coveord/platform-client';
import {MissingResourcePrivileges} from '../errors/snapshotErrors';
import {isSubset, without} from '../utils/list';

export async function ensureResourceAccess(
  client: PlatformClient,
  resourcesTypes: ResourceSnapshotType[],
  snapshotAccessType: SnapshotAccessType = SnapshotAccessType.Read
) {
  starSpinner('Validating resource access');
  const allowedResources = await client.resourceSnapshot.listResourceAccess();
  const allowed = isSubset(resourcesTypes, allowedResources);
  if (!allowed) {
    const missingResources = without(resourcesTypes, allowedResources);
    throw new MissingResourcePrivileges(missingResources, snapshotAccessType);
  }
}

export async function ensureSnapshotAccess(
  client: PlatformClient,
  snapshotId: string,
  snapshotAccessType: SnapshotAccessType = SnapshotAccessType.Read
) {
  starSpinner('Validating snapshot access');
  const {allowed} = await client.resourceSnapshot.validateAccess(snapshotId, {
    snapshotAccessType,
  });

  if (!allowed) {
    throw `TODO: You do not have ${snapshotAccessType} rights on the snapshot ${snapshotId}`;
  }
}
