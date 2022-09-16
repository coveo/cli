import {starSpinner} from '@coveo/cli-commons/utils/ux';
import PlatformClient, {
  ResourceSnapshotType,
  SnapshotAccessType,
} from '@coveord/platform-client';
import {isSubset} from '../utils/list';

export async function ensureResourceAccess(
  client: PlatformClient,
  resourcesTypes: ResourceSnapshotType[]
) {
  starSpinner('Validating resource access');
  const allowedResources = await client.resourceSnapshot.listResourceAccess();
  const isAllowed = isSubset(resourcesTypes, allowedResources);
  if (!isAllowed) {
    throw 'TODO: missing resources privileges';
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
