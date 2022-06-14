import type {Configuration} from '../../config/config.js';
import type {Snapshot} from '../snapshot.js';
import type {SnapshotReporter} from '../snapshotReporter.js';

export type VaultTransferFunctionsParam = {
  reporter: SnapshotReporter;
  snapshot: Snapshot;
  cfg: Configuration;
  projectPath?: string;
};
