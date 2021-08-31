import {ResourceSnapshotsSynchronizationPlanModel} from '@coveord/platform-client';

export class SynchronizationPlan {
  private possibleMatches: unknown[] = [];

  public constructor(
    public readonly model: ResourceSnapshotsSynchronizationPlanModel
  ) {}

  public containsUnambiguousMatches(): boolean {
    const synchronizationOperations =
      this.model.resourceSynchronizationOperations;
    if (!synchronizationOperations) {
      return false;
    }

    // TODO: WOWOWO trouver de quoi de moins complexe
    for (const [resourceName, operations] of Object.entries(
      synchronizationOperations
    )) {
      for (let i = 0; i < operations.length; i++) {
        const mactches = operations[i].matches;
        for (let j = 0; j < mactches.length; j++) {
          const match = mactches[j];
          // TODO: save the match so it can be printed later
          console.log(resourceName);
          console.log(operations[i].displayName);
          console.log(operations[i].matches[j].displayName);
          if (match.associationScore && match.associationScore < 1) {
            return false;
          }
          this.possibleMatches.push();
        }
      }
    }

    return true;
  }
}
