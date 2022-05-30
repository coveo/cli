jest.mock('@coveord/platform-client');
jest.mock('fs-extra');
jest.mock('json2csv');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');

import {test} from '@oclif/test';
import {Parser} from 'json2csv';
import {Config} from '../../../lib/config/config';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
const mockedAuthenticatedClient = jest.mocked(AuthenticatedClient);
const mockedConfig = jest.mocked(Config);
const mockSearch = jest.fn();
const mockedParser = jest.mocked(Parser);

mockedAuthenticatedClient.mockImplementation(
  () =>
    ({
      getClient: () => Promise.resolve({search: {query: mockSearch}}),
    } as unknown as AuthenticatedClient)
);

mockedParser.mockImplementation(
  () =>
    ({
      parse: jest.fn(),
    } as unknown as Parser<unknown>)
);

mockedConfig.mockImplementation(
  () =>
    ({
      get: () => Promise.resolve({organization: 'the_org'}),
    } as unknown as Config)
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

describe('org:search:dump', () => {
  beforeEach(() => {
    mockSearch.mockReset();
  });

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
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
    .stderr()
    .command(['org:search:dump', '-s', 'the_source_1', '-s', 'the_source_2'])
    .it('should pass multiple sources as a search filter', () =>
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          aq: expect.stringContaining(
            '( @source=="the_source_1" ) OR ( @source=="the_source_2" )'
          ),
        })
      )
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source_1', '-p', 'mypipeline'])
    .it('should pass pipeline as a search parameter', () =>
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          pipeline: 'mypipeline',
        })
      )
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .stderr()
    .command([
      'org:search:dump',
      '-s',
      'the_source_1',
      '-x',
      'foo',
      '-x',
      'bar',
    ])
    .it('should pass fieldsToExclude as a search parameter', () =>
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldsToExclude: ['foo', 'bar'],
        })
      )
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source', '-f', 'my-filter'])
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
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .it('should do only one query when no results are returned', () =>
      expect(mockSearch).toHaveBeenCalledTimes(1)
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
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
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .it('should request 1000 results', () =>
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          numberOfResults: 1000,
        })
      )
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .stderr()
    .command([
      'org:search:dump',
      '-s',
      'the_source',
      '-x',
      'rowid',
      '-x',
      'sysrowid',
      '-x',
      'foo',
    ])
    .it('should not exclude rowId fields', () =>
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          numberOfResults: 1000,
          fieldsToExclude: ['foo'],
        })
      )
    );

  test
    .do(() => {
      mockReturnNumberOfResults(10);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .it('should include rowid field in output', () =>
      expect(mockedParser).toHaveBeenCalledWith({
        fields: expect.arrayContaining(['rowid']),
      })
    );

  test
    .do(() => {
      mockReturnNumberOfResults(10);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source', '-x', 'rowid'])
    .it('should exclude rowid field from output', () =>
      expect(mockedParser).toHaveBeenCalledWith({
        fields: expect.not.arrayContaining(['rowid']),
      })
    );

  test
    .do(() => {
      mockReturnNumberOfResults(1234);
      mockReturnNumberOfResults(234);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .it('should perform subsequent query with rowid filter', () => {
      expect(mockSearch).toHaveBeenCalledTimes(2);
      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          aq: expect.stringContaining('@rowid>999'),
        })
      );
    });
});
