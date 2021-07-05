import {Command, flags} from '@oclif/command';
import {cli} from 'cli-ux';
import {ReadStream} from 'fs';
import {dedent} from 'ts-dedent';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {Project} from '../../../lib/project/project';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {
  snapshotSynchronizationUrl,
  snapshotUrl,
  SnapshotUrlOptionsArgs,
} from '../../../lib/platform/url';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {red, green} from 'chalk';
import {normalize} from 'path';
import {SnapshotReporter} from '../../../lib/snapshot/snapshotReporter';

export interface CustomFile extends ReadStream {
  type?: string;
}

export default abstract class SnapshotBase extends Command {
  public static description = 'Create and validate a snapshot';

  public static flags = {
    target: flags.string({
      char: 't',
      description:
        'The unique identifier of the organization where to send the changes. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
    deleteMissingResources: flags.boolean({
      char: 'd',
      description: 'Whether or not to show resources to delete',
      default: false,
      required: false,
    }),
  };

  public static hidden = true;

  protected async dryRun() {
    const project = new Project(normalize(this.projectPath));

    cli.action.start('Creating snapshot');
    const snapshot = await this.createSnapshotFromProject(project);

    cli.action.start('Validating snapshot');
    const reporter = await this.validateSnapshot(snapshot);

    cli.action.stop(reporter.isSuccessReport() ? green('✔') : red.bold('!'));
    return {reporter, snapshot, project};
  }

  protected async createSnapshotFromProject(
    project: Project
  ): Promise<Snapshot> {
    const pathToZip = await project.compressResources();
    const targetOrg = await this.getTargetOrg();

    return await SnapshotFactory.createFromZip(pathToZip, targetOrg);
  }

  protected async validateSnapshot(
    snapshot: Snapshot
  ): Promise<SnapshotReporter> {
    const reporter = await snapshot.validate(this.flags.deleteMissingResources);

    if (!reporter.isSuccessReport()) {
      await this.handleReportWithErrors(snapshot);
    }

    return reporter;
  }

  protected async getTargetOrg() {
    if (this.flags.target) {
      return this.flags.target;
    }
    const cfg = await this.configuration.get();
    return cfg.organization;
  }

  protected get projectPath() {
    return cwd();
  }

  protected async handleReportWithErrors(snapshot: Snapshot) {
    // TODO: CDX-362: handle invalid snapshot cases
    const pathToReport = snapshot.saveDetailedReport(this.projectPath);
    const report = snapshot.latestReport;

    if (snapshot.requiresSynchronization()) {
      const synchronizationPlanUrl = await this.getSynchronizationPage(
        snapshot
      );
      this.warn(
        dedent`
        Some conflicts were detected while comparing changes between the snapshot and the target organization.
        Click on the URL below to synchronize your snapshot with your organization before running the command again.
        ${synchronizationPlanUrl}
        `
      );
      return;
    }

    const snapshotUrl = await this.getSnapshotPage(snapshot);

    this.error(
      dedent`Invalid snapshot - ${report.resultCode}.
      Detailed report saved at ${pathToReport}.

      You can also use this link to view the snapshot in the Coveo Admin Console
      ${snapshotUrl}`
    );
  }

  private get flags() {
    const {flags} = this.parse(this.ctor as typeof SnapshotBase);
    return flags;
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private async getSnapshotPage(snapshot: Snapshot) {
    const options = await this.getSnapshotUrlOptions(snapshot);
    return snapshotUrl(options);
  }

  private async getSynchronizationPage(snapshot: Snapshot) {
    const options = await this.getSnapshotUrlOptions(snapshot);
    return snapshotSynchronizationUrl(options);
  }

  private async getSnapshotUrlOptions(
    snapshot: Snapshot
  ): Promise<SnapshotUrlOptionsArgs> {
    const {environment} = await this.configuration.get();
    return {
      environment,
      targetOrgId: snapshot.targetId,
      snapshotId: snapshot.id,
    };
  }
}
