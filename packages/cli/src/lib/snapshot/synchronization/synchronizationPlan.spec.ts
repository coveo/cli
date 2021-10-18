import {ResourceSnapshotsSynchronizationPlanModel} from '@coveord/platform-client';
import {
  getAmbiguousPlan,
  getUnambiguousPlan,
} from '../../../__stub__/resourceSnapshotsSynchronizationPlanModel';
import {fancyIt} from '../../../__test__/it';
import {SynchronizationPlan} from './synchronizationPlan';

describe('SynchronizationPlan', () => {
  describe('if the synchronization plan contains ambiguous matches', () => {
    let model: ResourceSnapshotsSynchronizationPlanModel;
    beforeAll(() => {
      model = getAmbiguousPlan();
    });

    fancyIt()('#containsUnambiguousMatches should return false', () => {
      const plan = new SynchronizationPlan(model);
      expect(plan.containsUnambiguousMatches()).toBe(false);
    });
  });

  describe('if the synchronization plan does not contain any ambiguous matches', () => {
    let model: ResourceSnapshotsSynchronizationPlanModel;
    beforeAll(() => {
      model = getUnambiguousPlan();
    });

    fancyIt()('#containsUnambiguousMatches should return true', () => {
      const plan = new SynchronizationPlan(model);
      expect(plan.containsUnambiguousMatches()).toBe(true);
    });
  });
});
