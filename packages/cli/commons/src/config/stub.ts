import {Region} from '@coveord/platform-client';
import type {Config, Configuration} from './config';
import {PlatformEnvironment} from '../platform/environment';

export const defaultConfiguration = {
  environment: PlatformEnvironment.Dev,
  organization: 'my-org',
  region: Region.US,
  accessToken: 'some-api-key-or-token',
  anonymous: false,
} as Configuration;

export const configurationMock: (
  configuration?: Configuration
) => () => Config =
  (configuration = defaultConfiguration) =>
  () =>
    ({
      get: () => configuration,
    } as Config);
