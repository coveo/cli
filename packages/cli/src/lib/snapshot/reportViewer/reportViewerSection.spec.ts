import stripAnsi from 'strip-ansi';
import dedent from 'ts-dedent';
import {
  ReportViewerOperationName,
  ReportViewerResourceReportModel,
} from './reportViewerDataModels';
import {ReportViewerSection} from './reportViewerSection';

describe('ReportViewerSection', () => {
  const resourceWithChanges: ReportViewerResourceReportModel = {
    name: 'FOO_RESOURCE',
    operations: {
      resourcesCreated: 10,
      resourcesDeleted: 2,
      resourcesInError: 4,
      resourcesRecreated: 0,
      resourcesUnchanged: 5,
      resourcesUpdated: 0,
    },
  };

  const unsyncedResource: ReportViewerResourceReportModel = {
    name: 'UNSYNCED_RESOURCE',
    operations: {
      resourcesCreated: 0,
      resourcesDeleted: 0,
      resourcesInError: 0,
      resourcesRecreated: 0,
      resourcesUnchanged: 0,
      resourcesUpdated: 0,
    },
  };

  const allOperationsAllowed: ReportViewerOperationName[] = [
    'resourcesCreated',
    'resourcesDeleted',
    'resourcesInError',
    'resourcesRecreated',
    'resourcesUnchanged',
    'resourcesUpdated',
  ];

  describe('when there are no resource changes', () => {
    it('should print nothing', () => {
      const section = new ReportViewerSection(
        unsyncedResource,
        allOperationsAllowed
      );

      expect(section.display(0)).toEqual('');
    });
  });

  describe('when there are resource changes', () => {
    const section = new ReportViewerSection(
      resourceWithChanges,
      allOperationsAllowed
    );

    it('should print all operations with changes', () => {
      expect(stripAnsi(section.display(0))).toContain(dedent`
      +10 to create
      -2 to delete
      !4 in error
       5 unchanged
      `);
    });

    it('should indent with right amount of spaces', () => {
      expect(stripAnsi(section.display(3))).toContain(dedent`
      +  10 to create
      -  2 to delete
      !  4 in error
         5 unchanged
      `);
    });
  });

  describe('when only a subset of operations are allowed ', () => {
    const section = new ReportViewerSection(resourceWithChanges, [
      'resourcesDeleted',
    ]);

    it('should print allowed operation', () => {
      expect(stripAnsi(section.display(0))).toContain(dedent`
      -2 to delete
      `);
    });
  });
});
