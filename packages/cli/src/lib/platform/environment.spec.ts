import {Environment, Region} from '@coveord/platform-client';
import {fancyIt} from '../../__test__/it';
import {
  castEnvironmentToPlatformClient,
  PlatformEnvironment,
  platformUrl,
} from './environment';

describe('platformUrl helper', () => {
  fancyIt()('should return https://platform.cloud.coveo.com by default', () => {
    expect(platformUrl()).toBe('https://platform.cloud.coveo.com');
  });

  fancyIt()(
    `when the environment is prod
    should not return it in the url e.g. https://platform.cloud.coveo.com`,
    () => {
      expect(platformUrl({environment: PlatformEnvironment.Prod})).toBe(
        'https://platform.cloud.coveo.com'
      );
    }
  );

  fancyIt()(
    `when the environment is not prod
    should return it in the url e.g. https://platformdev.cloud.coveo.com`,
    () => {
      expect(platformUrl({environment: PlatformEnvironment.Dev})).toBe(
        'https://platformdev.cloud.coveo.com'
      );
    }
  );

  fancyIt()(
    `when the region is U.S.
    should not return it in the url e.g. https://platform.cloud.coveo.com`,
    () => {
      expect(platformUrl({region: Region.US})).toBe(
        'https://platform.cloud.coveo.com'
      );
    }
  );

  fancyIt()(
    `when the region is not U.S.
    should return it in the url e.g. https://platform-eu.cloud.coveo.com`,
    () => {
      expect(platformUrl({region: Region.EU})).toBe(
        'https://platform-eu.cloud.coveo.com'
      );
    }
  );

  fancyIt()('should #castEnvironmentToPlatformClient correctly', () => {
    [
      {env: 'dev', platformClient: Environment.dev},
      {env: 'qa', platformClient: Environment.staging},
      {env: 'prod', platformClient: Environment.prod},
      {env: 'hipaa', platformClient: Environment.hipaa},
      {env: 'something_random', platformClient: Environment.prod},
    ].forEach((testCase) => {
      expect(
        castEnvironmentToPlatformClient(testCase.env as PlatformEnvironment)
      ).toBe(testCase.platformClient);
    });
  });
});
