jest.mock('../../lib/config/config');
jest.mock('../../hooks/analytics/analytics');
jest.mock('../../hooks/prerun/prerun');
jest.mock('../../lib/platform/authenticatedClient');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {OrganizationCreationOrigin} from '@coveord/platform-client';
import {Config} from '../../lib/config/config';

const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient, true);
const mockedConfig = jest.mocked(Config, true);
const mockedCreate = jest.fn();
const mockConfigSet = jest.fn();
const mockConfigGet = jest.fn().mockResolvedValue({
  organization: 'foo',
});

const mockAuthenticatedClient = () => {
  mockedAuthenticatedClient.mockImplementation(
    () =>
      ({
        getClient: () =>
          Promise.resolve({organization: {create: mockedCreate}}),
      } as unknown as AuthenticatedClient)
  );
};

const mockConfig = () => {
  mockedConfig.mockImplementation(
    () =>
      ({
        set: mockConfigSet,
        get: mockConfigGet,
      } as unknown as Config)
  );
};

describe('org:create', () => {
  beforeAll(() => {
    mockAuthenticatedClient();
    mockConfig();
    mockedCreate.mockReturnValue({id: 'mytestorg12345'});
  });

  test
    .stdout()
    .stderr()
    .command(['org:create', 'my-test-org'])
    .it('should create an organization with the right parameters', () => {
      expect(mockedCreate).toHaveBeenCalledWith({
        creationOrigin: OrganizationCreationOrigin.CLI,
        name: 'my-test-org',
        organizationTemplate: 'Developer',
      });
    });

  test
    .stdout()
    .stderr()
    .command(['org:create', 'my-test-org'])
    .it('should log the newly created org id', (ctx) => {
      expect(ctx.stderr).toContain(
        'Organization mytestorg12345 successfully created.'
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:create', 'my-test-org'])
    .it('should set the newly created org as the default one', () => {
      expect(mockConfigSet).toHaveBeenCalledWith(
        'organization',
        'mytestorg12345'
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:create', 'my-test-org', '--no-setDefaultOrganization'])
    .it('should not set default org', () => {
      expect(mockConfigSet).toHaveBeenCalledTimes(0);
    });
});
