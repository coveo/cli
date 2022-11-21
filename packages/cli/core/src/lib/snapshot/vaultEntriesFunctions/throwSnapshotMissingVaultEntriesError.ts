import {SnapshotMissingVaultEntriesError} from '../../errors/snapshotErrors.js';
import {VaultTransferFunctionsParam} from './interfaces.js';

export function throwSnapshotMissingVaultEntriesError({
  snapshot,
  cfg,
  projectPath,
}: VaultTransferFunctionsParam): never {
  throw new SnapshotMissingVaultEntriesError(snapshot, cfg, projectPath);
}
