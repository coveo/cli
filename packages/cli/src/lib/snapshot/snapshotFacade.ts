import chalk from 'chalk';
import {CliUx} from '@oclif/core';
import {Configuration} from '../config/config.js';
import {ProcessAbort} from '../errors/processError.js';
import {
  SnapshotSynchronizationAmbiguousMatchesError,
  SnapshotSynchronizationUnknownError,
} from '../errors/snapshotErrors.js';
import {confirmWithAnalytics} from '../utils/cli.js';
import {Snapshot, WaitUntilDoneOptions} from './snapshot.js';
import {SynchronizationPlan} from './synchronization/synchronizationPlan.js';

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
    // TODO: CDX-947: be specific on what the next operation will be doing
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
    CliUx.ux.action.start('Checking for automatic synchronization');
    const plan = await this.snapshot.createSynchronizationPlan();

    if (!plan.containsUnambiguousMatches()) {
      throw new SnapshotSynchronizationAmbiguousMatchesError(
        this.snapshot,
        this.cfg
      );
    }

    CliUx.ux.action.stop(chalk.green('✔'));
    return plan;
  }

  private async applySynchronizationPlan(plan: SynchronizationPlan) {
    CliUx.ux.action.start('Synchronizing resources');
    const reporter = await this.snapshot.applySynchronizationPlan(
      plan.model.id,
      this.waitUntilDone
    );
    const success = reporter.isSuccessReport();

    if (!success) {
      throw new SnapshotSynchronizationUnknownError(this.snapshot, this.cfg);
    }

    CliUx.ux.action.stop(chalk.green('✔'));
  }
}
