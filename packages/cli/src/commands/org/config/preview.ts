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

export interface CustomFile extends ReadStream {
  type?: string;
}

export default class Preview extends Command {
  public static description = 'Preview resource updates';

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
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(Preview);
    const project = new Project(flags.projectPath);
    const pathToZip = await project.compressResources();
    const targetOrg = await this.getTargetOrg();

    cli.action.start('Creating snapshot');

    const snapshot = await SnapshotFactory.createFromZip(pathToZip, targetOrg);

    cli.action.start('Validating snapshot');

    const {isValid} = await snapshot.validate();

    if (!isValid) {
      this.handleInvalidSnapshot(snapshot);
    }

    await snapshot.preview();

    if (isValid) {
      await snapshot.delete();
    }

    project.deleteTemporaryZipFile();

    cli.action.stop();
  }

  public async getTargetOrg() {
    const {flags} = this.parse(Preview);
    if (flags.target) {
      return flags.target;
    }
    const cfg = await this.configuration.get();
    return cfg.organization;
  }

  private async handleInvalidSnapshot(snapshot: Snapshot) {
    // TODO: CDX-362: handle invalid snapshot cases
    const {flags} = this.parse(Preview);
    const pathToReport = snapshot.saveDetailedReport(flags.projectPath);
    const report = snapshot.latestReport;

    if (snapshot.requiresSynchronization()) {
      cli.action.start('Synchronization');

      const synchronizationPlanUrl = await this.getSynchronizationPage(
        snapshot
      );
      cli.log();
      this.warn(
        dedent`Some conflicts were detected while comparing changes between the snapshot and the target organization.
        Click on the URL below to synchronize your snapshot with your organization before running the command again.
        ${synchronizationPlanUrl}`
      );
      cli.log();
      return;
    }

    const snapshotUrl = this.getSnapshotPage(snapshot);

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
