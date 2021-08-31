import {
  ResourceSnapshotsReportResultCode,
  ResourceSnapshotsReportStatus,
  ResourceSnapshotsSynchronizationReportModel,
} from '@coveord/platform-client';

export class SnapshotSynchronizationReporter {
  public constructor(
    public readonly report: ResourceSnapshotsSynchronizationReportModel
  ) {}

  // TODO: figure a way to remove duplicate method
  public isSuccessReport(): boolean {
    const {status, resultCode} = this.report;
    return (
      status === ResourceSnapshotsReportStatus.Completed &&
      resultCode === ResourceSnapshotsReportResultCode.Success
    );
  }
}
