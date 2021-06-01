import {ResourceSnapshotsReportModel} from '@coveord/platform-client';
import {Command, flags} from '@oclif/command';
import {cli} from 'cli-ux';
import {ReadStream} from 'fs';
import {dedent} from 'ts-dedent';
import {ensureFileSync, writeJsonSync} from 'fs-extra';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Project} from '../../../lib/project/project';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';

export interface CustomFile extends ReadStream {
  type?: string;
}

export default class Preview extends Command {
  static description = 'Preview resource updates';

  static flags = {
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

  static hidden = true;

  @Preconditions(IsAuthenticated())
  async run() {
    const {flags} = this.parse(Preview);
    const project = new Project(flags.projectPath);
    const pathToZip = await project.compressResources();
    const targetOrg = await this.getTargetOrg();

    cli.action.start('Creating snapshot');

    const snapshot = await SnapshotFactory.createFromZip(pathToZip, targetOrg);

    cli.action.start('Validating snapshot');

    const {isValid, report} = await snapshot.validate();

    if (!isValid) {
      this.handleInvalidSnapshot(report);
    }

    await snapshot.preview();
    await snapshot.delete();

    project.deleteTemporaryZipFile();

    cli.action.stop();
  }

  private saveDetailedReport(report: ResourceSnapshotsReportModel) {
    const {flags} = this.parse(Preview);
    const pathToReport = `${flags.projectPath}/.snapshot-reports/${report.id}.json`;
    ensureFileSync(pathToReport);
    writeJsonSync(pathToReport, report, {spaces: 2});
    return pathToReport;
  }

  private handleInvalidSnapshot(report: ResourceSnapshotsReportModel) {
    const pathToReport = this.saveDetailedReport(report);
    // TODO: CDX-362: handle invalid snashot cases
    this.error(
      dedent`Invalid snapshot - ${report.resultCode}.
      Please consult detailed report ${pathToReport}`
    );
  }

  async getTargetOrg() {
    const {flags} = this.parse(Preview);
    if (flags.target) {
      return flags.target;
    }
    const cfg = await this.configuration.get();
    return cfg.organization;
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }
}
