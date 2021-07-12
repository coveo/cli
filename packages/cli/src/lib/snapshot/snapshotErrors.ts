export class SnapshotOperationTimeoutError extends Error {
  public static readonly message = 'OPERATION_TIMED_OUT';
  public constructor() {
    super(SnapshotOperationTimeoutError.message);
  }
}
