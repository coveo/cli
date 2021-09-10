import {
  ResourceSnapshotsSynchronizationOperationsModel,
  ResourceSnapshotsSynchronizationPlanModel,
} from '@coveord/platform-client';

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
        if (this.hasUncertainMatch(operation)) {
          return false;
        }
      }
    }
    return true;
  }

  private hasUncertainMatch(
    operation: ResourceSnapshotsSynchronizationOperationsModel
  ) {
    return operation.matches.some((match) => (match.associationScore || 0) < 1);
  }
}
