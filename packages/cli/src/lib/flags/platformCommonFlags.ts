import {Region} from '@coveord/platform-client';
import {flags} from '@oclif/command';
import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_REGION,
  PlatformEnvironment,
} from '../platform/environment';

export const withRegion = (withDefault = true) => ({
  region: flags.string({
    char: 'r',
    options: Object.keys(Region),
    default: withDefault ? DEFAULT_REGION : undefined,
    description:
      'The Coveo Platform region to log in to. See <https://docs.coveo.com/en/2976>.',
  }),
});

export const withEnvironment = (withDefault = true) => ({
  environment: flags.string({
    char: 'e',
    options: Object.values(PlatformEnvironment),
    default: withDefault ? DEFAULT_ENVIRONMENT : undefined,
    description: 'The Coveo Platform environment to log in to.',
  }),
});
