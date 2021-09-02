import {green} from 'chalk';
import {cli} from 'cli-ux';
import {Configuration} from '../config/config';
import {
  SnapshotOperationAbort,
  SnapshotSynchronizationAmbiguousMatchesError,
  SnapshotSynchronizationUnknownError,
} from '../errors/snapshotErrors';
import {Snapshot} from './snapshot';
import {SynchronizationPlan} from './synchronization/synchronizationPlan';

export class SnapshotFacade {
  public constructor(private snapshot: Snapshot, private cfg: Configuration) {}

  public async tryAutomaticSynchronization() {
    const plan = await this.createSynchronizationPlan();
    await this.waitForConfirmation();
    await this.applySynchronizationPlan(plan);
  }

  private async waitForConfirmation() {
    const canApplySynchronizationPlan = await cli.confirm(
      'Synchronization plan matched all resources with great confidence, do you want to proceed? (y/n)'
    );
    if (!canApplySynchronizationPlan) {
      throw new SnapshotOperationAbort(this.snapshot, this.cfg);
    }
  }

  private async createSynchronizationPlan() {
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

  private async applySynchronizationPlan(plan: SynchronizationPlan) {
    cli.action.start('Synchronizing resources');
    const reporter = await this.snapshot.applySynchronizationPlan(
      plan.model.id
    );
    const success = reporter.isSuccessReport();

    if (!success) {
      throw new SnapshotSynchronizationUnknownError(this.snapshot, this.cfg);
    }

    cli.action.stop(green('✔'));
  }
}
