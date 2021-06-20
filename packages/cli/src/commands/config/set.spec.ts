jest.mock('../../lib/config/config');
jest.mock('../../hooks/analytics/analytics');
jest.mock('../../hooks/prerun/prerun');
jest.mock('../../lib/platform/authenticatedClient');

import {mocked} from 'ts-jest/utils';
import {Config} from '../../lib/config/config';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
const mockedConfig = mocked(Config);
const mockedClient = mocked(AuthenticatedClient);

describe('config:set', () => {
  const mockSet = jest.fn();
  const mockGetHasAccessToOrg = jest.fn();

  mockedConfig.mockImplementation(
    () =>
      ({
        set: mockSet,
      } as unknown as Config)
  );

  mockedClient.mockImplementation(
    () =>
      ({
        getUserHasAccessToOrg: mockGetHasAccessToOrg,
      } as unknown as AuthenticatedClient)
  );

  test
    .stderr()
    .stdout()
    .command(['config:set'])
    .it(
      'allows to call set without any flags and should not modify configuration',
      () => {
        expect(mockSet).not.toHaveBeenCalled();
      }
    );

  ['dev', 'qa', 'prod', 'hipaa'].forEach((environment) => {
    test
      .stderr()
      .stdout()
      .command(['config:set', '-e', environment])
      .it(`allows to modify environment ${environment}`, () => {
        expect(mockSet).toHaveBeenCalledWith('environment', environment);
      });
  });

  test
    .stderr()
    .stdout()
    .command(['config:set', '-e', 'foo'])
    .catch(/Expected --environment=foo/)
    .it('fails when trying to set an invalid environment', () => {
      expect(mockSet).not.toHaveBeenCalled();
    });

  [
    'us-east-1',
    'eu-west-1',
    'eu-west-3',
    'ap-southeast-2',
    'us-west-2',
  ].forEach((region) => {
    test
      .stderr()
      .stdout()
      .command(['config:set', '-r', region])
      .it(`allows to modify region ${region}`, () => {
        expect(mockSet).toHaveBeenCalledWith('region', region);
      });
  });

  test
    .stderr()
    .stdout()
    .command(['config:set', '-r', 'foo'])
    .catch(/Expected --region=foo/)
    .it('fails when trying to set an invalid region', () => {
      expect(mockSet).not.toHaveBeenCalled();
    });

  test
    .stderr()
    .stdout()
    .do(() => {
      mockGetHasAccessToOrg.mockReturnValueOnce(Promise.resolve(true));
    })
    .command(['config:set', '-o', 'the_org'])
    .it(
      'allows to modify the organization of the user has access to it',
      () => {
        expect(mockSet).toHaveBeenCalledWith('organization', 'the_org');
      }
    );

  test
    .do(() => {
      mockGetHasAccessToOrg.mockReturnValueOnce(Promise.resolve(false));
    })
    .stderr()
    .stdout()
    .command(['config:set', '-o', 'the_org'])
    .catch(/do not have access to organization the_org/)
    .it(
      'fails when trying to set to an invalid organzation the user does not have access to',
      () => {
        expect(mockSet).not.toHaveBeenCalled();
      }
    );

  test
    .stderr()
    .stdout()
    .command(['config:set', '-a', 'y'])
    .it('allows to modify the analytics configuration', () => {
      expect(mockSet).toHaveBeenCalledWith('analyticsEnabled', true);
    });
});
