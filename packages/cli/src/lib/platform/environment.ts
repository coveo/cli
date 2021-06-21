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

export const DEFAULT_ENVIRONMENT = 'prod' as const;
export const DEFAULT_REGION = 'us-east-1' as const;

type PlatformUrlOptions = {
  environment: PlatformEnvironment;
  region: PlatformRegion;
};

const defaultOptions: PlatformUrlOptions = {
  environment: DEFAULT_ENVIRONMENT,
  region: DEFAULT_REGION,
};

export function platformUrl(options?: Partial<PlatformUrlOptions>) {
  options = {...defaultOptions, ...options};
  const urlEnv =
    options.environment === DEFAULT_ENVIRONMENT ? '' : options.environment;
  const urlRegion =
    options.region === DEFAULT_REGION ? '' : `-${options.region}`;

  return `https://platform${urlEnv}${urlRegion}.cloud.coveo.com`;
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
