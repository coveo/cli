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
const mockedSearch = jest.fn();
const mockedParser = jest.mocked(Parser);

mockedAuthenticatedClient.mockImplementation(
  () =>
    ({
      getClient: () => Promise.resolve({search: {query: mockedSearch}}),
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

const mockFailedSearch = (err: Object, always: boolean) => {
  const implementation = () => Promise.reject(err);

  if (always) {
    mockedSearch.mockImplementation(implementation);
  } else {
    mockedSearch.mockImplementationOnce(implementation);
  }
};

const mockReturnNumberOfResults = (
  numberOfResults: number,
  additionalRaw: Record<string, unknown> = {}
) => {
  if (numberOfResults === 0) {
    mockedSearch.mockImplementationOnce(() =>
      Promise.resolve({totalCount: 0, results: []})
    );
  } else {
    mockedSearch.mockImplementationOnce(() =>
      Promise.resolve({
        totalCount: numberOfResults,
        results: [...Array(Math.min(1000, numberOfResults)).keys()].map(
          (i) => ({
            raw: {
              a_field: 'a_value',
              rowid: i,
              ...additionalRaw,
            },
          })
        ),
      })
    );
  }
};

describe('org:search:dump', () => {
  beforeEach(() => {
    mockedSearch.mockReset();
  });

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .it('should pass the source as a search filter', () =>
      expect(mockedSearch).toHaveBeenCalledWith(
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
      expect(mockedSearch).toHaveBeenCalledWith(
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
      expect(mockedSearch).toHaveBeenCalledWith(
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
      expect(mockedSearch).toHaveBeenCalledWith(
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
      expect(mockedSearch).toHaveBeenCalledWith(
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
      expect(mockedSearch).toHaveBeenCalledTimes(1)
    );

  test
    .do(() => {
      mockReturnNumberOfResults(0);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .it('should sort by rowid', () =>
      expect(mockedSearch).toHaveBeenCalledWith(
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
      expect(mockedSearch).toHaveBeenCalledWith(
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
      expect(mockedSearch).toHaveBeenCalledWith(
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
      expect(mockedSearch).toHaveBeenCalledTimes(2);
      expect(mockedSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          aq: expect.stringContaining('@rowid>999'),
        })
      );
    });

  test
    .do(() => {
      mockReturnNumberOfResults(1234);
      mockReturnNumberOfResults(1, {someField: 'ohaye'});
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .it(
      'should use all fields for the header of the CSV, even if the fields is not used on the first result',
      () => {
        expect(mockedParser).toHaveBeenCalledWith({
          fields: expect.arrayContaining(['someField']),
        });
      }
    );

  test
    .do(() => {
      mockFailedSearch({type: 'ResponseExceededMaximumSizeException'}, false);
      mockReturnNumberOfResults(20);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .it(
      'should query less results if the API returns a ResponseExceededMaximumSizeException',
      () => {
        expect(mockedSearch).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            numberOfResults: 1000,
          })
        );
        expect(mockedSearch).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            numberOfResults: 500,
          })
        );
      }
    );

  test
    .do(() => {
      mockFailedSearch({type: 'ResponseExceededMaximumSizeException'}, false);
      mockReturnNumberOfResults(20);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .it(
      'should query less results if the API returns a ResponseExceededMaximumSizeException',
      () => {
        expect(mockedSearch).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            numberOfResults: 1000,
          })
        );
        expect(mockedSearch).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            numberOfResults: 500,
          })
        );
      }
    );

  test
    .do(() => {
      mockFailedSearch({type: 'ResponseExceededMaximumSizeException'}, true);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .catch(/Cannot query a single result, please exclude some\/more fields/)
    .it(
      'should throw a well formated error if even a single result is too much'
    );

  test
    .do(() => {
      mockFailedSearch(new Error('someError'), false);
    })
    .stdout()
    .stderr()
    .command(['org:search:dump', '-s', 'the_source'])
    .catch('someError')
    .it(
      'should bubble up the error if another error than `ResponseExceededMaximumSizeException` is thrown'
    );
});
