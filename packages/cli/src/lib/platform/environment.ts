import {Environment, Region} from '@coveord/platform-client';

export enum PlatformEnvironment {
  Dev = 'dev',
  QA = 'qa',
  Hipaa = 'hipaa',
  Prod = 'prod',
}

export const DEFAULT_ENVIRONMENT = PlatformEnvironment.Prod as const;
export const DEFAULT_REGION = Region.US as const;

export type PlatformUrlOptions = {
  environment: PlatformEnvironment;
  region: Region;
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
