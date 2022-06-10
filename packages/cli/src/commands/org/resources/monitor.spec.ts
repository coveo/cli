jest.mock('../../../lib/config/config');
jest.mock('../../../hooks/analytics/analytics');
jest.mock('../../../hooks/prerun/prerun');
jest.mock('../../../lib/platform/authenticatedClient');
jest.mock('../../../lib/snapshot/snapshotReporter');
jest.mock('../../../lib/snapshot/snapshotFactory');

import {Config} from '../../../lib/config/config';
import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {test} from '@oclif/test';
import {getDummySnapshotModel} from '../../../__stub__/resourceSnapshotsModel';
import {getSuccessReport} from '../../../__stub__/resourceSnapshotsReportModel';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';
import {SnapshotReportStatus} from '../../../lib/snapshot/reportPreviewer/reportPreviewerDataModels';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {Snapshot} from '../../../lib/snapshot/snapshot';

const mockedSnapshotFactory = jest.mocked(SnapshotFactory, true);
const mockedConfig = jest.mocked(Config);
const mockedConfigGet = jest.fn();
const mockedGetSnapshot = jest.fn();
const mockedWaitUntilDone = jest.fn();
const mockedValidateSnapshot = jest.fn();
const mockedPreviewSnapshot = jest.fn();
const mockedDeleteSnapshot = jest.fn();
const mockedSaveDetailedReport = jest.fn();
const mockedAreResourcesInError = jest.fn();
const mockedLatestReport = jest.fn();
const mockedCreateSynchronizationPlan = jest.fn();
const mockedApplySynchronizationPlan = jest.fn();

const mockedSnapshotReporter = jest.mocked(SnapshotReporter, true);

const mockSnapshotFactory = () => {
  mockedSnapshotFactory.createFromExistingSnapshot.mockReturnValue(
    Promise.resolve({
      validate: mockedValidateSnapshot,
      preview: mockedPreviewSnapshot,
      delete: mockedDeleteSnapshot,
      saveDetailedReport: mockedSaveDetailedReport,
      areResourcesInError: mockedAreResourcesInError,
      latestReport: mockedLatestReport,
      waitUntilDone: mockedWaitUntilDone,
      createSynchronizationPlan: mockedCreateSynchronizationPlan,
      applySynchronizationPlan: mockedApplySynchronizationPlan,
      id: 'banana-snapshot',
      targetId: 'potato-org',
    } as unknown as Snapshot)
  );
};

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

const doMockSnapshotReporter = (snapshotReportStatus: SnapshotReportStatus) => {
  let handlerToCall: (
    this: SnapshotReporter
  ) => void | Promise<void> = () => {};
  mockedSnapshotReporter.prototype.setReportHandler.mockImplementation(
    function (
      this: SnapshotReporter,
      status: SnapshotReportStatus,
      handler: (this: SnapshotReporter) => void | Promise<void>
    ) {
      if (status === snapshotReportStatus) {
        handlerToCall = handler;
      }
      return this;
    }
  );
  mockedSnapshotReporter.prototype.handleReport.mockImplementation(
    async function (this: SnapshotReporter) {
      await handlerToCall.apply(this);
    }
  );
};

describe('org:resources:monitor', () => {
  beforeAll(() => {
    doMockConfig();
    mockSnapshotFactory();
    doMockSnapshotReporter(SnapshotReportStatus.SUCCESS);
    mockedGetSnapshot.mockResolvedValue(
      getDummySnapshotModel('default-org', 'my-snapshot', [
        getSuccessReport('my-snapshot', ResourceSnapshotsReportType.Apply),
      ])
    );
  });

  test
    .command(['org:resources:monitor'])
    .catch(/Missing 1 required arg/)
    .it('requires snapshotId name argument');
});
