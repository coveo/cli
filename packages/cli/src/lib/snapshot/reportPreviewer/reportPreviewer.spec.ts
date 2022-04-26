import {test} from '@oclif/test';

import {ResourceSnapshotsReportType} from '@coveord/platform-client';
import {ReportViewer} from './reportPreviewer';
import dedent from 'ts-dedent';
import {SnapshotReporter} from '../snapshotReporter';
import {
  getErrorReport,
  getReportWithNoProcessedResources,
  getSuccessReport,
} from '../../../__stub__/resourceSnapshotsReportModel';
import {formatCliLog} from '../../../__test__/jestSnapshotUtils';

describe('ReportViewer', () => {
  describe('when the report contains errors', () => {
    let viewer: ReportViewer;
    beforeAll(() => {
      const reporter = new SnapshotReporter(
        getErrorReport('some-id', ResourceSnapshotsReportType.DryRun)
      );
      viewer = new ReportViewer(reporter);
    });

    test
      .stdout()
      .stderr()
      .do(async () => {
        await viewer.display();
      })
      .it('should print the same report', (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      });
  });

  describe('when the report does not contain errors', () => {
    let viewer: ReportViewer;
    beforeAll(() => {
      const reporter = new SnapshotReporter(
        getSuccessReport('some-id', ResourceSnapshotsReportType.DryRun)
      );
      viewer = new ReportViewer(reporter);
    });

    test
      .stdout()
      .stderr()
      .do(async () => {
        await viewer.display();
      })
      .it('should print resource changes', (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      });
  });

  describe('when the report contains no changes', () => {
    let viewer: ReportViewer;
    beforeAll(() => {
      const reporter = new SnapshotReporter(
        getReportWithNoProcessedResources(
          'some-id',
          ResourceSnapshotsReportType.DryRun
        )
      );
      viewer = new ReportViewer(reporter);
    });

    test
      .stdout()
      .stderr()
      .do(async () => {
        await viewer.display();
      })
      .it('should show that no changes were detected', (ctx) => {
        expect(formatCliLog(ctx.stdout)).toMatchSnapshot();
      });
  });
});
