import {Region} from '@coveord/platform-client';
import type {Config, Configuration} from '../lib/config/config';
import {PlatformEnvironment} from '../lib/platform/environment';

export const defaultConfiguration = {
  environment: PlatformEnvironment.Dev,
  organization: 'my-org',
  region: Region.US,
  analyticsEnabled: true,
} as Configuration;

export const configurationMock: (
  configuration?: Configuration
) => () => Config =
  (configuration = defaultConfiguration) =>
  () =>
    ({
      get: () => configuration,
    } as Config);
