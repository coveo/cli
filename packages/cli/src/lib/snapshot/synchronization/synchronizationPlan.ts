import {ResourceSnapshotsSynchronizationPlanModel} from '@coveord/platform-client';

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

    for (const synchronizationOperation of Object.values(
      synchronizationOperations
    )) {
      for (const operation of synchronizationOperation) {
        if (
          operation.matches.some((match) => (match.associationScore || 0) < 1)
        ) {
          return false;
        }
      }
    }
    return true;
  }
}
