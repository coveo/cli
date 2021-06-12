import {Command, flags} from '@oclif/command';
import {cli} from 'cli-ux';
import {ReadStream} from 'fs';
import {dedent} from 'ts-dedent';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Project} from '../../../lib/project/project';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';
import {platformUrl} from '../../../lib/platform/environment';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {red, green, bold} from 'chalk';
import {normalize} from 'path';

export interface CustomFile extends ReadStream {
  type?: string;
}

export default class Push extends Command {
  public static description =
    'Preview, validate and deploy your changes to the destination org';

  public static flags = {
    target: flags.string({
      char: 't',
      description:
        'The unique identifier of the organization where to send the changes. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
    projectPath: flags.string({
      char: 'p',
      description: 'The path to your Coveo project.',
      helpValue: '/Users/Me/my-project',
      default: cwd(),
      required: false,
    }),
    deleteMissingResources: flags.boolean({
      char: 'd',
      description:
        'Whether or not to delete resources missing in the destination',
      default: false,
      required: false,
    }),
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(Push);
    const project = new Project(normalize(flags.projectPath));
    const pathToZip = await project.compressResources();
    const targetOrg = await this.getTargetOrg();

    cli.action.start('Creating snapshot');

    const snapshot = await SnapshotFactory.createFromZip(pathToZip, targetOrg);

    cli.action.start('Validating snapshot');

    const {isValid} = await snapshot.validate(flags.deleteMissingResources);
    await snapshot.preview();

    cli.action.stop(isValid ? green('✔') : red.bold('!'));

    if (isValid) {
      await this.handleValidReport(snapshot);
      await snapshot.delete();
    } else {
      await this.handleReportWithErrors(snapshot);
    }

    project.deleteTemporaryZipFile();
  }

  public async getTargetOrg() {
    const {flags} = this.parse(Push);
    if (flags.target) {
      return flags.target;
    }
    const cfg = await this.configuration.get();
    return cfg.organization;
  }

  private async handleValidReport(snapshot: Snapshot) {
    if (!snapshot.hasChangedResources()) {
      return;
    }
    const targetOrg = await this.getTargetOrg();
    const canBeApplied = await cli.confirm(
      `\nWould you like to apply these changes to the org ${bold(
        targetOrg
      )}? (yes/no)`
    );

    if (canBeApplied) {
      cli.action.start('Applying snapshot');
      const {isValid} = await snapshot.apply();

      if (!isValid) {
        await this.handleReportWithErrors(snapshot);
      }

      cli.action.stop(isValid ? green('✔') : red.bold('!'));
    }
  }

  private async handleReportWithErrors(snapshot: Snapshot) {
    // TODO: CDX-362: handle invalid snapshot cases
    const {flags} = this.parse(Push);
    const pathToReport = snapshot.saveDetailedReport(flags.projectPath);
    const report = snapshot.latestReport;

    if (snapshot.requiresSynchronization()) {
      const synchronizationPlanUrl = await this.getSynchronizationPage(
        snapshot
      );
      this.log();
      this.warn(
        dedent`
        Some conflicts were detected while comparing changes between the snapshot and the target organization.
        Click on the URL below to synchronize your snapshot with your organization before running the command again.
        ${synchronizationPlanUrl}
        `
      );
      this.log();
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

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private async getSnapshotPage(snapshot: Snapshot) {
    const {environment} = await this.configuration.get();
    const url = platformUrl({environment});
    const targetOrg = snapshot.targetId;
    return `${url}/admin/#${targetOrg}/organization/resource-snapshots/${snapshot.id}`;
  }

  private async getSynchronizationPage(snapshot: Snapshot) {
    return `${await this.getSnapshotPage(snapshot)}/synchronization`;
  }
}
