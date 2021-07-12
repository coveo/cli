import {ResourceType} from '@coveord/platform-client';
import {flags, Command} from '@oclif/command';
import {IOptionFlag} from '@oclif/command/lib/flags';
import {cwd} from 'process';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Project} from '../../../lib/project/project';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';

export default class Pull extends Command {
  public static description = 'Pull resources from an organization';

  public static flags = {
    target: flags.string({
      char: 't',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
      description:
        'The unique identifier of the organization from which to pull the resources. If not specified, the organization you are connected to will be used.',
    }),
    resourceTypes: flags.string({
      char: 'r',
      helpValue: 'type1 type2',
      options: Object.keys(ResourceType),
      default: Object.keys(ResourceType),
      multiple: true,
      description: 'The resources types to pull from the organization.',
    }) as IOptionFlag<(keyof typeof ResourceType)[]>,
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const snapshot = await this.getSnapshot();
    await this.refreshProject(snapshot);
    await snapshot.delete();
  }

  private async refreshProject(snapshot: Snapshot) {
    const project = new Project(this.projectPath);
    const snapshotBlob = await snapshot.download();
    await project.refresh(snapshotBlob);
  }

  private async getSnapshot() {
    const target = await this.getTargetOrg();
    return SnapshotFactory.createFromOrg(this.resourceTypesToExport, target);
  }

  private async getTargetOrg() {
    const {flags} = this.parse(Pull);
    if (flags.target) {
      return flags.target;
    }
    const cfg = await this.configuration.get();
    return cfg.organization;
  }

  private get configuration() {
    return new Config(this.config.configDir, this.error);
  }

  private get resourceTypesToExport() {
    const {flags} = this.parse(Pull);
    return flags.resourceTypes.map((type) => ResourceType[type]);
  }

  private get projectPath() {
    return cwd();
  }
}
