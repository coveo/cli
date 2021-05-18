jest.mock('../../lib/config/config');
jest.mock('../../hooks/analytics/analytics');
jest.mock('../../hooks/prerun/prerun');
jest.mock('../../lib/platform/authenticatedClient');

import {mocked} from 'ts-jest/utils';
import {test} from '@oclif/test';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {OrganizationModel} from '@coveord/platform-client';

const mockedClient = mocked(AuthenticatedClient);
const mockGetOrgs = jest.fn().mockReturnValue(Promise.resolve([]));

describe('org:list', () => {
  const createMockOrgDefinition = (id: string): OrganizationModel => ({
    createdDate: new Date().getTime(),
    displayName: `${id}_displayName`,
    id,
    owner: {email: `${id}_owner_email`},
    publicContentOnly: false,
    readOnly: false,
    type: 'TRIAL',
  });

  mockedClient.mockImplementation(
    () =>
      ({
        getAllOrgsUserHasAccessTo: mockGetOrgs,
      } as unknown as AuthenticatedClient)
  );

  test
    .stdout()
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
