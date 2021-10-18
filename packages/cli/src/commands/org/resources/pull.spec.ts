jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/snapshot/snapshotFactory');
jest.mock('../../../lib/project/project');
jest.mock('../../../lib/utils/process');
jest.mock('../../../lib/decorators/preconditions');

import {Config} from '../../../lib/config/config';
import {mocked} from 'ts-jest/utils';
import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {test} from '@oclif/test';
import {getDummySnapshotModel} from '../../../__stub__/resourceSnapshotsModel';
import {getSuccessReport} from '../../../__stub__/resourceSnapshotsReportModel';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {Snapshot} from '../../../lib/snapshot/snapshot';

const mockedSnapshotFactory = mocked(SnapshotFactory, true);
const mockedConfig = mocked(Config);
const mockedConfigGet = jest.fn();
const mockedGetSnapshot = jest.fn();
const mockedDownloadSnapshot = jest.fn();
const mockedDeleteSnapshot = jest.fn();

const doMockConfig = () => {
  mockedConfigGet.mockReturnValue(
    Promise.resolve({
      region: 'us',
      organization: 'default-org',
      environment: 'prod',
    })
  );

  mockedConfig.mockImplementation(
    () =>
      ({
        get: mockedConfigGet,
      } as unknown as Config)
  );
};

const doMockSnapshotFactory = async () => {
  mockedSnapshotFactory.createFromOrg.mockReturnValue(
    Promise.resolve({
      delete: mockedDeleteSnapshot,
      download: mockedDownloadSnapshot,
    } as unknown as Snapshot)
  );
};

describe('org:resources:pull', () => {
  beforeAll(() => {
    doMockConfig();
    doMockSnapshotFactory();

    mockedGetSnapshot.mockResolvedValue(
      getDummySnapshotModel('default-org', 'my-snapshot', [
        getSuccessReport('my-snapshot', ResourceSnapshotsReportType.Apply),
      ])
    );
  });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should download the snapshot', () => {
      expect(mockedDownloadSnapshot).toHaveBeenCalled();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should delete the snapshot', () => {
      expect(mockedDeleteSnapshot).toHaveBeenCalled();
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should select all resource types', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.arrayContaining([
          'FIELD',
          'FEATURED_RESULT',
          'SOURCE',
          'QUERY_PIPELINE',
          'SEARCH_PAGE',
          'EXTENSION',
        ]),
        'default-org',
        expect.objectContaining({})
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-r', 'field', 'featuredResult', 'source'])
    .it('should select specified resource types', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        ['FIELD', 'FEATURED_RESULT', 'SOURCE'],
        'default-org',
        expect.objectContaining({})
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull'])
    .it('should set a 60 seconds timeout', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.arrayContaining([]),
        'default-org',
        {wait: 60}
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-w', '78'])
    .it('should set a 78 seconds timeout', () => {
      expect(mockedSnapshotFactory.createFromOrg).toHaveBeenCalledWith(
        expect.arrayContaining([]),
        'default-org',
        {wait: 78}
      );
    });

  test
    .stdout()
    .stderr()
    .command(['org:resources:pull', '-r', 'invalidresource'])
    .catch((ctx) => {
      expect(ctx.message).toContain(
        'Expected --resourceTypes=invalidresource to be one of'
      );
    })
    .it('should not allow invalid resource');
});
