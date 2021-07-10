import {ResourceType} from '@coveord/platform-client';
import {flags, Command} from '@oclif/command';
import {Config} from '../../../lib/config/config';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {Snapshot} from '../../../lib/snapshot/snapshot';
import {SnapshotFactory} from '../../../lib/snapshot/snapshotFactory';

export default class Pull extends Command {
  public static description = 'Pull resources from an organization';

  public static flags = {
    target: flags.string({
      char: 't',
      description:
        'The unique identifier of the organization from which to pull the resources. If not specified, the organization you are connected to will be used.',
      helpValue: 'destinationorganizationg7dg3gd',
      required: false,
    }),
    // TODO: CDX-447: add flag to select resource types to export
  };

  public static hidden = true;

  @Preconditions(IsAuthenticated())
  public async run() {
    const snapshot = await this.getSnapshot();

    await this.refreshProject(snapshot);
    await snapshot.delete();
  }

  private async refreshProject(_snapshot: Snapshot) {
    // TODO: CDX-446: refresh project
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
    // TODO: CDX-447: pass resource types to export
    return [ResourceType.field, ResourceType.extension];
  }
}
