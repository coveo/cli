jest.mock('@coveo/cli-commons/analytics/amplitudeClient');
jest.mock('@coveo/cli-commons/config/config');
jest.mock('@coveo/cli-commons/preconditions/authenticated');

jest.mock('@coveo/cli-commons/platform/authenticatedClient');
jest.mock('@coveo/platform-client');

import {test} from '@oclif/test';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  SourceModel,
  SourceStatusType,
  SourceType,
  SourceVisibility,
} from '@coveo/platform-client';
import {IsAuthenticated} from '@coveo/cli-commons/preconditions';
import {mockPreconditions} from '@coveo/cli-commons/preconditions/mockPreconditions';
import {formatCliLog} from '@coveo/cli-commons-dev/testUtils/jestSnapshotUtils';

describe('source:push:list', () => {
  const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
  const mockedIsAuthenticated = jest.mocked(IsAuthenticated);

  const mockListSources = jest.fn();

  const createMockSourceModel = (id: string): SourceModel => ({
    name: `${id}_displayName`,
    id,
    owner: 'bob',
    sourceVisibility: SourceVisibility.SECURED,
    sourceType: SourceType.PUSH,
    information: {
      sourceStatus: {type: SourceStatusType.PUSH_READY},
      numberOfDocuments: 1234,
    },
  });

  const doMockListSource = function () {
    mockListSources.mockReturnValue(
      Promise.resolve({totalEntries: 0, sourceModels: []})
    );
  };

  const doMockPreconditions = function () {
    const preconditionStatus = {
      authentication: true,
    };
    const mockedPreconditions = mockPreconditions(preconditionStatus);
    mockedIsAuthenticated.mockReturnValue(mockedPreconditions.authentication);
  };

  beforeEach(() => {
    mockedAuthenticatedClient.mockImplementation(
      () =>
        ({
          cfg: {
            get: () => ({organization: 'foo'}),
          },
          getClient: () => Promise.resolve({source: {list: mockListSources}}),
        } as unknown as AuthenticatedClient)
    );
    doMockPreconditions();
    doMockListSource();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test
    .stdout()
    .stderr()
    .command(['source:list'])
    .it('works when there is no push source configured', (ctx) => {
      expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
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
    .command(['source:list'])
    .it('works when the user has access to a list of push source', (ctx) => {
      expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
    });
});
