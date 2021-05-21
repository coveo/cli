jest.mock('@coveord/platform-client');
jest.mock('../../lib/platform/authenticatedClient');

import {test} from '@oclif/test';
import {mocked} from 'ts-jest/utils';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
const mockedAuthenticatedClient = mocked(AuthenticatedClient);
const mockSearch = jest.fn();

mockedAuthenticatedClient.mockImplementation(
  () =>
    ({
      getClient: () => Promise.resolve({search: {query: mockSearch}}),
    } as unknown as AuthenticatedClient)
);

const mockReturnNumberOfResults = (numberOfResults: number) => {
  if (numberOfResults === 0) {
    mockSearch.mockReturnValueOnce({totalCount: 0, results: []});
  } else {
    mockSearch.mockReturnValueOnce({
      totalCount: numberOfResults,
      results: [...Array(Math.min(1000, numberOfResults)).keys()].map((i) => ({
        raw: {
          a_field: 'a_value',
          rowid: i,
        },
      })),
    });
  }
};

describe('search:dump', () => {
  beforeEach(() => {
    mockSearch.mockReset();
  });

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .command(['search:dump', '-s', 'the_source'])
    .it('should pass the source as a search filter', () =>
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          aq: expect.stringContaining('@source=="the_source"'),
        })
      )
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .command(['search:dump', '-s', 'the_source', '-f', 'my-filter'])
    .it('should pass additional filter as a search filter', () =>
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          aq: expect.stringContaining('my-filter'),
        })
      )
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .command(['search:dump', '-s', 'the_source'])
    .it('should do only one query when no results are returned', () =>
      expect(mockSearch).toHaveBeenCalledTimes(1)
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .command(['search:dump', '-s', 'the_source'])
    .it('should sort by rowid', () =>
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          sortCriteria: '@rowid ascending',
        })
      )
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .command(['search:dump', '-s', 'the_source'])
    .it('should request 1000 results', () =>
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          numberOfResults: 1000,
        })
      )
    );

  test
    .do(() => {
      mockReturnNumberOfResults(1234);
      mockReturnNumberOfResults(234);
    })
    .stdout()
    .command(['search:dump', '-s', 'the_source'])
    .it('should perform subsequent query with rowid filter', () => {
      expect(mockSearch).toHaveBeenCalledTimes(2);
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          aq: expect.stringContaining('@rowid>999'),
        })
      );
    });
});
