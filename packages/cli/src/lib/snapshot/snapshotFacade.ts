import {green} from 'chalk';
import {cli} from 'cli-ux';
import {Configuration} from '../config/config';
import {ProcessAbort} from '../errors/processError';
import {
  SnapshotSynchronizationAmbiguousMatchesError,
  SnapshotSynchronizationUnknownError,
} from '../errors/snapshotErrors';
import {confirmWithAnalytics} from '../utils/cli';
import {Snapshot, WaitUntilDoneOptions} from './snapshot';
import {SynchronizationPlan} from './synchronization/synchronizationPlan';

export class SnapshotFacade {
  public constructor(
    private snapshot: Snapshot,
    private cfg: Configuration,
    private waitUntilDone?: WaitUntilDoneOptions
  ) {}

  public async tryAutomaticSynchronization(prompt = true) {
    const plan = await this.createSynchronizationPlan();
    if (prompt) {
      await this.waitForConfirmation();
    }
    await this.applySynchronizationPlan(plan);
  }

  private async waitForConfirmation() {
    const question =
      'Synchronization plan matched all resources, do you want to proceed? (y/n)';
    const synchronize = await confirmWithAnalytics(
      question,
      'synchronization apply'
    );
    if (!synchronize) {
      throw new ProcessAbort();
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
      plan.model.id,
      this.waitUntilDone
    );
    const success = reporter.isSuccessReport();

    if (!success) {
      throw new SnapshotSynchronizationUnknownError(this.snapshot, this.cfg);
    }

    cli.action.stop(green('✔'));
  }
}
