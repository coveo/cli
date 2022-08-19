import type {Configuration} from '@coveo/cli-commons/lib/config/config';
import type {Snapshot} from '../snapshot';
import type {SnapshotReporter} from '../snapshotReporter';

export type VaultTransferFunctionsParam = {
  reporter: SnapshotReporter;
  snapshot: Snapshot;
  cfg: Configuration;
  projectPath?: string;
};
