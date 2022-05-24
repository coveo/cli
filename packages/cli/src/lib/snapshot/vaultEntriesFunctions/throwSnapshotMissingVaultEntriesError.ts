import {SnapshotMissingVaultEntriesError} from '../../errors/snapshotErrors';
import {VaultTransferFunctionsParam} from './interfaces';

export function throwSnapshotMissingVaultEntriesError({
  snapshot,
  cfg,
  projectPath,
}: VaultTransferFunctionsParam): never {
  throw new SnapshotMissingVaultEntriesError(snapshot, cfg, projectPath);
}
