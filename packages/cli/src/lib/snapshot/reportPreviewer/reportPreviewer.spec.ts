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
      .do(() => {
        viewer.display();
      })
      .it(
        'should print a report section with the resources in error',
        (ctx) => {
          expect(ctx.stdout).toContain('Error Report:');
          expect(ctx.stdout).toContain('7 resources in error');
        }
      );

    test
      .stdout()
      .do(() => {
        viewer.display();
      })
      .it('should not print more than 5 errors per resources', (ctx) => {
        expect(ctx.stdout).toContain(
          dedent`
          Fields
            • RESOURCE_ALREADY_EXISTS: Field foo already exists.
            • RESOURCE_ALREADY_EXISTS: Field bar already exists.
            • RESOURCE_ALREADY_EXISTS: Field dsads already exists.
            • RESOURCE_ALREADY_EXISTS: Field fdww already exists.
            • RESOURCE_ALREADY_EXISTS: Field csad already exists.
            (2 more errors)`
        );
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
      .do(() => {
        viewer.display();
      })
      .it('should print resource changes', (ctx) => {
        // Remove padding added by cli-ux so we can test the text and not the padding on the line
        const trimedStdout = ctx.stdout
          .split(/$/m)
          .map((s) => s.trimEnd())
          .join('');

        expect(trimedStdout).toContain(dedent`
        Previewing resource changes:
           Extensions
        +   1 to create
        -   2 to delete
        ~   1 to update
           Fields
        ~   1 to update
        `);
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
      .do(() => {
        viewer.display();
      })
      .it('should show that no changes were detected', (ctx) => {
        expect(ctx.stdout).toContain('No changes detected');
      });
  });
});
