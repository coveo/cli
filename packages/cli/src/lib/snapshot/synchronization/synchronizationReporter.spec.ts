import {ResourceSnapshotsSynchronizationReportModel} from '@coveord/platform-client';
import {SnapshotSynchronizationReporter} from './synchronizationReporter';
import {
  getSuccessfulSynchronizationReport,
  getUnsuccessfulSynchronizationReport,
} from '../../../__stub__/resourceSnapshotsSynchronizationReportModel';
import {fancyIt} from '../../../__test__/it';

describe('SynchronizationReporter', () => {
  describe('if the report contains a successful synchronization', () => {
    let report: ResourceSnapshotsSynchronizationReportModel;
    beforeAll(() => {
      report = getSuccessfulSynchronizationReport();
    });

    fancyIt()('#isSuccessReport should return true', () => {
      const reporter = new SnapshotSynchronizationReporter(report);
      expect(reporter.isSuccessReport()).toBe(true);
    });
  });

  describe('if the report contains a failed synchronization', () => {
    let report: ResourceSnapshotsSynchronizationReportModel;
    beforeAll(() => {
      report = getUnsuccessfulSynchronizationReport();
    });

    fancyIt()('#isSuccessReport should return false', () => {
      const reporter = new SnapshotSynchronizationReporter(report);
      expect(reporter.isSuccessReport()).toBe(false);
    });
  });
});
