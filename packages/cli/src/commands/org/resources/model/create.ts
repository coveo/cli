import {Command} from '@oclif/command';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../../lib/decorators/preconditions';
import {Trackable} from '../../../../lib/decorators/preconditions/trackable';
import open from 'open';
import {AuthenticatedClient} from '../../../../lib/platform/authenticatedClient';
import {createSnapshotUrl} from '../../../../lib/platform/url';
import {cli} from 'cli-ux';
import dedent from 'ts-dedent';

export default class Create extends Command {
  public static description = 'Create a Snapshot Pull Model';

  public static flags = {};

  public static hidden = true;

  @Trackable({eventName: 'org resources pull - new model'})
  @Preconditions(IsAuthenticated())
  public async run() {
    await this.openPlatform();
    cli.log(dedent`Make sure to save the snapshot for the CLI, so you can run
    "org:resources:pull -m <path/to/snapshot.json>" to pull your organization resources.`);
  }

  private async openPlatform() {
    const url = await this.getPlatformUrl();
    open(url);
  }

  private async getPlatformUrl() {
    const cfg = await new AuthenticatedClient().cfg.get();
    return createSnapshotUrl(cfg.organization, {
      environment: cfg.environment,
      region: cfg.region,
    });
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }
}
