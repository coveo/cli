import {ResourceSnapshotsReportOperationModel} from '@coveo/platform-client';

export type ResourceOperationCountName = Exclude<
  keyof ResourceSnapshotsReportOperationModel,
  `${string}Names`
>;

export type ReportViewerOperationName = ResourceOperationCountName;
export type ReportViewerOperationCounts = Pick<
  ResourceSnapshotsReportOperationModel,
  ResourceOperationCountName
>;

export interface ReportViewerResourceReportModel {
  name: string;
  operations: ReportViewerOperationCounts;
}

export enum SnapshotReportStatus {
  SUCCESS = 'SUCCESS',
  NO_CHANGES = 'NO_CHANGES',
  MISSING_VAULT_ENTRIES = 'MISSING_VAULT_ENTRIES',
  ERROR = 'ERROR',
}
