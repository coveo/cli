import type {Configuration} from '@coveo/cli-commons/config/config';
import type {Snapshot} from '../snapshot.js';
import type {SnapshotReporter} from '../snapshotReporter.js';

export type VaultTransferFunctionsParam = {
  reporter: SnapshotReporter;
  snapshot: Snapshot;
  cfg: Configuration;
  projectPath?: string;
};
