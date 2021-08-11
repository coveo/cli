import {Command, flags} from '@oclif/command';
import {blueBright} from 'chalk';
import {cli} from 'cli-ux';
import {cwd} from 'process';
import dedent from 'ts-dedent';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {IsGitInstalled} from '../../../lib/decorators/preconditions/git';
import {SnapshotOperationTimeoutError} from '../../../lib/errors';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {
  displayInvalidSnapshotError,
  displaySnapshotSynchronizationWarning,
  dryRun,
  getTargetOrg,
  handleSnapshotError,
  waitFlag,
  DryRunOptions,
  cleanupProject,
} from '../../../lib/snapshot/snapshotCommon';

export default class Preview extends Command {
  public static description = 'Preview resource updates';

  public static flags = {
    ...waitFlag,
    target: flags.string({
      char: 't',
      description:
        'The unique identifier of the organization where to send the changes. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
    showMissingResources: flags.boolean({
      char: 'd',
      description: 'Preview resources deletion when enabled',
      default: false,
      required: false,
    }),
    snapshotId: flags.string({
      char: 's',
      description:
        'The unique identifier of the snapshot to preview. If not specified, a new snapshot will be created from your local project. You can list available snapshots in your organization with org:config:list',
      required: false,
    }),
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated(), IsGitInstalled())
  public async run() {
    const {flags} = this.parse(Preview);
    const target = await getTargetOrg(this.configuration, flags.target);
    const {reporter, snapshot, project} = await dryRun(
      target,
      this.projectPath,
      this.options
    );

    await snapshot.preview(project, this.options.deleteMissingResources);

    if (reporter.isSuccessReport()) {
      await snapshot.delete();
    } else {
      await this.handleReportWithErrors(snapshot);
    }

    project.deleteTemporaryZipFile();

    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(Preview);
    cleanupProject(this.projectPath);
    handleSnapshotError(err);
    await this.displayAdditionalErrorMessage(err);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
  }

  private async displayAdditionalErrorMessage(err?: Error) {
    if (err instanceof SnapshotOperationTimeoutError) {
      const {flags} = this.parse(Preview);
      const snapshot = err.snapshot;
      const target = await getTargetOrg(this.configuration, flags.target);
      cli.log(
        dedent`

          Once the snapshot is created, you can preview it with the following command:

            ${blueBright`coveo org:config:preview -t ${target} -s ${snapshot.id}`}

            `
      );
    }
  }

  private async handleReportWithErrors(snapshot: Snapshot) {
    const cfg = await this.configuration.get();

    if (snapshot.requiresSynchronization()) {
      displaySnapshotSynchronizationWarning(snapshot, cfg);
      return;
    }

    displayInvalidSnapshotError(snapshot, cfg, this.projectPath);
  }

  private get options(): DryRunOptions {
    const {flags} = this.parse(Preview);
    return {
      deleteMissingResources: flags.showMissingResources,
      waitUntilDone: {wait: flags.wait},
    };
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get projectPath() {
    return cwd();
  }
}
