import {Environment, Region} from '@coveord/platform-client';
import {
  castEnvironmentToPlatformClient,
  castRegionToPlatformClient,
  platformUrl,
} from './environment';

describe('platformUrl helper', () => {
  it('should return https://platform.cloud.coveo.com by default', () => {
    expect(platformUrl()).toBe('https://platform.cloud.coveo.com');
  });

  it(`when the environment is prod
    should not return it in the url e.g. https://platform.cloud.coveo.com`, () => {
    expect(platformUrl({environment: 'prod'})).toBe(
      'https://platform.cloud.coveo.com'
    );
  });

  it(`when the environment is not prod
    should return it in the url e.g. https://platformdev.cloud.coveo.com`, () => {
    expect(platformUrl({environment: 'dev'})).toBe(
      'https://platformdev.cloud.coveo.com'
    );
  });

  it(`when the region is us-east-1
    should not return it in the url e.g. https://platform.cloud.coveo.com`, () => {
    expect(platformUrl({region: 'us-east-1'})).toBe(
      'https://platform.cloud.coveo.com'
    );
  });

  it(`when the region is not us-east-1
    should return it in the url e.g. https://platform-us-west-2.cloud.coveo.com`, () => {
    expect(platformUrl({region: 'us-west-2'})).toBe(
      'https://platform-us-west-2.cloud.coveo.com'
    );
  });

  it('should #castEnvironmentToPlatformClient correctly', () => {
    [
      {env: 'dev' as const, platformClient: Environment.dev},
      {env: 'qa' as const, platformClient: Environment.staging},
      {env: 'prod' as const, platformClient: Environment.prod},
      {env: 'hipaa' as const, platformClient: Environment.hipaa},
    ].forEach((testCase) => {
      expect(castEnvironmentToPlatformClient(testCase.env)).toBe(
        testCase.platformClient
      );
    });
  });

  it('should #castRegionToPlatformClient correctly', () => {
    [
      {region: 'us-east-1' as const, platformClient: Region.US},
      {region: 'us-west-2' as const, platformClient: Region.US},
      {region: 'eu-west-1' as const, platformClient: Region.EU},
      {region: 'eu-west-3' as const, platformClient: Region.EU},
      {region: 'ap-southeast-2' as const, platformClient: Region.AU},
    ].forEach((testCase) => {
      expect(castRegionToPlatformClient(testCase.region)).toBe(
        testCase.platformClient
      );
    });
  });
});
