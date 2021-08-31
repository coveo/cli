import {ResourceSnapshotsSynchronizationPlanModel} from '@coveord/platform-client';

// SnapshotSynchronizer
// SnapshotSynchronation
export class SynchronizationPlan {
  public constructor(
    public readonly model: ResourceSnapshotsSynchronizationPlanModel
  ) {}

  public containsUnambiguousMatches(): boolean {
    const synchronizationOperations =
      this.model.resourceSynchronizationOperations;
    if (!synchronizationOperations) {
      return false;
    }

    for (const [_, operations] of Object.entries(synchronizationOperations)) {
      for (let i = 0; i < operations.length; i++) {
        const matches = operations[i].matches;
        for (let j = 0; j < matches.length; j++) {
          const match = matches[j];
          if (match.associationScore && match.associationScore < 1) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
