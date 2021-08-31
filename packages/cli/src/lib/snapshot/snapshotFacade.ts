import {ResourceSnapshotsSynchronizationPlanModel} from '@coveord/platform-client';
import {green, red} from 'chalk';
import {cli} from 'cli-ux';
import {Configuration} from '../config/config';
import {
  SnapshotSynchronizationAbort,
  SnapshotSynchronizationAmbiguousMatchesError,
  SnapshotSynchronizationUnknownError,
} from '../errors/snapshotErrors';
import {Snapshot} from './snapshot';
import {SynchronizationPlan} from './synchronization/synchronizationPlan';
import {SynchronizationPlanPreviewer} from './synchronization/synchronizationPlanPreviewer';

export class SnapshotFacade {
  public constructor(private snapshot: Snapshot, private cfg: Configuration) {}

  public async tryAutomaticSynchronization() {
    const plan = await this.canApplyPlan();
    this.previewPlan(plan.model);
    await this.waitForConfirmation();
    await this.applyPlan(plan);
  }

  private async waitForConfirmation() {
    const canApplySynchronizationPlan = await cli.confirm(
      'Would you like to synchronize your snapshot? (y/n)'
    );
    if (!canApplySynchronizationPlan) {
      throw new SnapshotSynchronizationAbort(this.snapshot, this.cfg);
    }
  }

  private previewPlan(model: ResourceSnapshotsSynchronizationPlanModel) {
    const previewer = new SynchronizationPlanPreviewer(model);
    previewer.display();
  }

  private async canApplyPlan() {
    cli.action.start('Checking for automatic synchronization');
    const plan = await this.snapshot.createSynchronizationPlan();

    if (!plan.containsUnambiguousMatches()) {
      throw new SnapshotSynchronizationAmbiguousMatchesError(
        this.snapshot,
        this.cfg
      );
    }

    cli.action.stop(green('✔'));
    return plan;
  }

  private async applyPlan(plan: SynchronizationPlan) {
    cli.action.start('Applying synchronization plan');
    const reporter = await this.snapshot.applySynchronizationPlan(
      plan.model.id
    );
    const success = reporter.isSuccessReport();

    if (!success) {
      throw new SnapshotSynchronizationUnknownError(this.snapshot, this.cfg);
    }

    cli.action.stop(success ? green('✔') : red.bold('!'));
  }
}
