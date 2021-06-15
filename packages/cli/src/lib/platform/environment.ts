import {Environment, Region} from '@coveord/platform-client';

type PlatformCombination =
  | {env: 'dev'; region: 'us-east-1' | 'eu-west-1' | 'eu-west-3'}
  | {env: 'qa'; region: 'us-east-1' | 'eu-west-1' | 'ap-southeast-2'}
  | {env: 'hipaa'; region: 'us-east-1'}
  | {env: 'prod'; region: 'us-east-1' | 'us-west-2' | 'eu-west-1'};

export type PlatformEnvironment = PlatformCombination['env'];
export type PlatformRegion = Extract<
  PlatformCombination,
  {env: PlatformEnvironment}
>['region'];

export function platformUrl<E extends PlatformEnvironment = 'prod'>(options?: {
  environment?: E;
  region?: PlatformRegion;
}) {
  const urlEnv =
    !options || !options.environment || options.environment === 'prod'
      ? ''
      : options.environment;
  const urlRegion =
    !options || !options.region || options.region === 'us-east-1'
      ? ''
      : `-${options.region}`;

  return `https://platform${urlEnv}${urlRegion}.cloud.coveo.com`;
}

export function platformSnapshotUrl<
  E extends PlatformEnvironment = 'prod'
>(options: {environment: E; targetOrgId: string; snapshotId: string}) {
  const url = platformUrl({environment: options.environment});
  return `${url}/admin/#${options.targetOrgId}/organization/resource-snapshots/${options.snapshotId}`;
}

export function platformSnapshotSynchronizationUrl<
  E extends PlatformEnvironment = 'prod'
>(options: {environment: E; targetOrgId: string; snapshotId: string}) {
  const url = platformSnapshotUrl(options);
  return `${url}/synchronization`;
}

export function castEnvironmentToPlatformClient(
  e: PlatformEnvironment
): Environment {
  switch (e) {
    case 'dev':
      return Environment.dev;
    case 'qa':
      return Environment.staging;
    case 'prod':
      return Environment.prod;
    case 'hipaa':
      return Environment.hipaa;
    default:
      return Environment.prod;
  }
}

export function castRegionToPlatformClient(r: PlatformRegion): Region {
  switch (r) {
    case 'us-east-1':
    case 'us-west-2':
      return Region.US;
    case 'eu-west-1':
    case 'eu-west-3':
      return Region.EU;
    case 'ap-southeast-2':
      return Region.AU;
    default:
      return Region.US;
  }
}
