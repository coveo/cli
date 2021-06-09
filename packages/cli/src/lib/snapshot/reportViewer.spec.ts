// jest.mock('../platform/authenticatedClient');
// jest.mock('fs');
// jest.mock('fs-extra');
import {test} from '@oclif/test';

import {
  ResourceSnapshotsReportModel,
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsReportType,
} from '@coveord/platform-client';
import {ReportViewer} from './reportViewer';
import {EOL} from 'os';

const getReportWithoutChanges = (
  snapshotId: string
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  updatedDate: 1622555847000,
  type: ResourceSnapshotsReportType.DryRun,
  status: ResourceSnapshotsReportStatus.Completed,
  resourcesProcessed: 12,
  resultCode: ResourceSnapshotsReportResultCode.Success,
  resourceOperations: {
    EXTENSION: {
      resourcesCreated: 0,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
    FIELD: {
      resourcesCreated: 0,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
  },
  resourceOperationResults: {},
});

const getSuccessReport = (
  snapshotId: string
): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  updatedDate: 1622555847000,
  type: ResourceSnapshotsReportType.DryRun,
  status: ResourceSnapshotsReportStatus.Completed,
  resultCode: ResourceSnapshotsReportResultCode.Success,
  resourceOperations: {
    EXTENSION: {
      resourcesCreated: 1,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 2,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
    FIELD: {
      resourcesCreated: 0,
      resourcesUpdated: 1,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
    FILTER: {
      resourcesCreated: 0,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
  },
  resourceOperationResults: {},
});

const getErrorReport = (snapshotId: string): ResourceSnapshotsReportModel => ({
  id: snapshotId,
  updatedDate: 1622555847000,
  type: ResourceSnapshotsReportType.DryRun,
  status: ResourceSnapshotsReportStatus.Completed,
  resultCode: ResourceSnapshotsReportResultCode.ResourcesInError,
  resourceOperations: {
    EXTENSION: {
      resourcesCreated: 1,
      resourcesUpdated: 0,
      resourcesRecreated: 0,
      resourcesDeleted: 2,
      resourcesInError: 0,
      resourcesUnchanged: 0,
    },
    FIELD: {
      resourcesCreated: 0,
      resourcesUpdated: 1,
      resourcesRecreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 7,
      resourcesUnchanged: 0,
    },
  },
  resourceOperationResults: {
    FIELD: {
      foo_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field foo already exists.'],
      bar_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field bar already exists.'],
      dsads_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field dsads already exists.'],
      fdww_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field fdww already exists.'],
      csad_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field csad already exists.'],
      hjkd_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field hjkd already exists.'],
      fdasf_4VNj5ds5: ['RESOURCE_ALREADY_EXISTS: Field fdasf already exists.'],
    },
  },
});

describe('ReportViewer', () => {
  describe('when the report contains errors', () => {
    let viewer: ReportViewer;
    beforeAll(() => {
      viewer = new ReportViewer(getErrorReport('some-id'));
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
          [
            ' Fields',
            '  • RESOURCE_ALREADY_EXISTS: Field foo already exists.',
            '  • RESOURCE_ALREADY_EXISTS: Field bar already exists.',
            '  • RESOURCE_ALREADY_EXISTS: Field dsads already exists.',
            '  • RESOURCE_ALREADY_EXISTS: Field fdww already exists.',
            '  • RESOURCE_ALREADY_EXISTS: Field csad already exists.',
            '  (2 more errors)',
          ].join(EOL)
        );
      });
  });

  describe('when the report does not contain errors', () => {
    let viewer: ReportViewer;
    beforeAll(() => {
      viewer = new ReportViewer(getSuccessReport('some-id'));
    });

    test
      .stdout()
      .do(() => {
        viewer.display();
      })
      .it('should print resource changes', (ctx) => {
        expect(ctx.stdout).toMatch(
          new RegExp(
            [
              'Extensions',
              '\\+\\s+1 to create',
              '-\\s+2 to delete',
              'Fields',
              '~\\s+1 to update',
            ].join('.*\\n.*')
          )
        );
      });
  });
});

// TODO:
// describe('when the report contains no changes', () => {});
