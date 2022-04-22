import {ResourceSnapshotsReportOperationModel} from '@coveord/platform-client';

export type ReportViewerOperationName =
  keyof ResourceSnapshotsReportOperationModel;

export interface ReportViewerResourceReportModel {
  name: string;
  operations: ResourceSnapshotsReportOperationModel;
}

export enum SnapshotReportStatus {
  SUCCESS = 'SUCCESS',
  MISSING_VAULT_ENTRIES = 'MISSING_VAULT_ENTRIES',
  ERROR = 'ERROR',
}
