import {Command, flags} from '@oclif/command';
import {cli} from 'cli-ux';
import {ReadStream} from 'fs';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Project} from '../../../lib/project/project';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';

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

    const snapshot = await SnapshotFactory.createFromZip(
      pathToZip,
      'cli-preview-snapshot'
    );

    cli.action.start('Creating snapshot');

    const targetOrg = await this.getTargetOrg();
    await snapshot.push(targetOrg, 'cli-preview-snapshot');

    cli.action.start('Validating snapshot');

    await snapshot.validate(targetOrg);
    await snapshot.preview();
    await snapshot.delete();

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

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }
}
