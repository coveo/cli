import {Command, flags} from '@oclif/command';
import {cli} from 'cli-ux';
import {ReadStream} from 'fs';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {Project} from '../../../lib/utils/project';

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
    const snapshot = new Snapshot();
    const project = new Project(flags.projectPath);

    const pathToZip = await project.compressResources();

    cli.action.start('Creating snapshot');
    await snapshot.createSnapshotFromZip(pathToZip, 'cli-preview-snapshot');

    const targetOrg = await this.getTargetOrg();
    await snapshot.pushSnapshotToTarget(targetOrg);

    cli.action.start('Validating snapshot');
    await snapshot.validateSnapshot(targetOrg);
    await snapshot.previewSnapshot();
    await snapshot.deleteSnapshot();

    project.deleteTemporaryZipFile();

    cli.action.stop();
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
