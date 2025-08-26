jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');
jest.mock('@coveo/cli-commons/preconditions/authenticated');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {OrganizationModel} from '@coveo/platform-client';
import {IsAuthenticated} from '@coveo/cli-commons/preconditions';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';

describe('org:list', () => {
  const mockedClient = jest.mocked(AuthenticatedClient);
  const mockGetOrgs = jest.fn().mockReturnValue(Promise.resolve([]));
  const mockedIsAuthenticated = jest.mocked(IsAuthenticated);

  const createMockOrgDefinition = (id: string): OrganizationModel => ({
    createdDate: new Date().getTime(),
    displayName: `${id}_displayName`,
    id,
    owner: {email: `${id}_owner_email`},
    publicContentOnly: false,
    readOnly: false,
    type: 'TRIAL',
    configuration: {
      servingExperimentAllowed: false,
    },
  });

  const doMockPreconditions = function () {
    const preconditionStatus = {
      authentication: true,
    };
    const mockedPreconditions = mockPreconditions(preconditionStatus);
    mockedIsAuthenticated.mockReturnValue(mockedPreconditions.authentication);
  };

  beforeAll(() => {
    mockedClient.mockImplementation(
      () =>
        ({
          getAllOrgsUserHasAccessTo: mockGetOrgs,
        } as unknown as AuthenticatedClient)
    );
    doMockPreconditions();
  });

  test
    .stdout()
    .stderr()
    .command(['org:list'])
    .it('works when the user has access to no org', (ctx) => {
      expect(ctx.stdout).toContain(
        'You do not have access to any organization'
      );
    });

  test
    .do(() => {
      mockGetOrgs.mockReturnValueOnce(
        Promise.resolve([
          createMockOrgDefinition('first_org'),
          createMockOrgDefinition('second_org'),
        ])
      );
    })
    .stdout()
    .stderr()
    .command(['org:list'])
    .it('works when the user has access to a list of org', (ctx) => {
      expect(ctx.stdout).toContain('first_org');
      expect(ctx.stdout).toContain('second_org');
    });

  test
    .do(() => {
      mockGetOrgs.mockReturnValueOnce(
        Promise.resolve([
          createMockOrgDefinition('first_org'),
          createMockOrgDefinition('second_org'),
        ])
      );
    })
    .stdout()
    .stderr()
    .command(['org:list', '-x'])
    .it(
      'works when the user has access to a list of org with extended details',
      (ctx) => {
        expect(ctx.stdout).toContain('first_org_owner_email');
        expect(ctx.stdout).toContain('first_org_displayName');
        expect(ctx.stdout).toContain('second_org_owner_email');
        expect(ctx.stdout).toContain('second_org_displayName');
      }
    );
});
