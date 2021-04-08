import {Environment, Region} from '@coveord/platform-client';
import {
  castEnvironmentToPlatformClient,
  castRegionToPlatformClient,
  PlatformEnvironment,
  PlatformRegion,
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

  it('should #castRegionToPlatformClient correctly', () => {
    [
      {region: 'us-east-1', platformClient: Region.US},
      {region: 'us-west-2', platformClient: Region.US},
      {region: 'eu-west-1', platformClient: Region.EU},
      {region: 'eu-west-3', platformClient: Region.EU},
      {region: 'ap-southeast-2', platformClient: Region.AU},
      {region: 'something_random', platformClient: Region.US},
    ].forEach((testCase) => {
      expect(
        castRegionToPlatformClient(testCase.region as PlatformRegion)
      ).toBe(testCase.platformClient);
    });
  });
});
