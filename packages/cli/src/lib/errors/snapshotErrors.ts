import {Snapshot} from '../snapshot/snapshot';

export class SnapshotOperationTimeoutError extends Error {
  public static readonly message = 'OPERATION_TIMED_OUT';
  public constructor(public snapshot: Snapshot) {
    super(SnapshotOperationTimeoutError.message);
  }
}
