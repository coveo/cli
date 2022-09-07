jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/trackable');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveord/platform-client');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  SourceModel,
  SourceStatusType,
  SourceVisibility,
} from '@coveord/platform-client';

const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);

const mockListSources = jest
  .fn()
  .mockReturnValue(Promise.resolve({totalEntries: 0, sourceModels: []}));

describe('source:push:list', () => {
  const createMockSourceModel = (id: string): SourceModel => ({
    name: `${id}_displayName`,
    id,
    owner: 'bob',
    sourceVisibility: SourceVisibility.SECURED,
    information: {
      sourceStatus: {type: SourceStatusType.PUSH_READY},
      numberOfDocuments: 1234,
    },
  });

  mockedAuthenticatedClient.mockImplementation(
    () =>
      ({
        cfg: {
          get: () => Promise.resolve({organization: 'foo'}),
        },
        getClient: () => Promise.resolve({source: {list: mockListSources}}),
      } as unknown as AuthenticatedClient)
  );

  test
    .stdout()
    .stderr()
    .command(['source:push:list'])
    .it('works when there is no push source configured', (ctx) => {
      expect(ctx.stdout).toContain(
        'There is no push source in organization foo'
      );
    });

  test
    .do(() => {
      mockListSources.mockReturnValueOnce(
        Promise.resolve({
          totalEntries: 1,
          sourceModels: [createMockSourceModel('the_id')],
        })
      );
    })
    .stdout()
    .stderr()
    .command(['source:push:list'])
    .it('works when the user has access to a list of push source', (ctx) => {
      // headers of table
      expect(ctx.stdout).toContain('Name');
      expect(ctx.stdout).toContain('Id');
      expect(ctx.stdout).toContain('Owner');
      expect(ctx.stdout).toContain('Source visibility');
      expect(ctx.stdout).toContain('Status');
      expect(ctx.stdout).toContain('Number of documents');

      // values of table
      expect(ctx.stdout).toContain('the_id_displayName');
      expect(ctx.stdout).toContain('the_id');
      expect(ctx.stdout).toContain('bob');
      expect(ctx.stdout).toContain('SECURED');
      expect(ctx.stdout).toContain('PUSH_READY');
      expect(ctx.stdout).toContain('1234');
    });
});
