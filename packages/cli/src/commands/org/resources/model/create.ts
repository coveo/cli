import {Command} from '@oclif/core';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../../lib/decorators/preconditions';
import {Trackable} from '../../../../lib/decorators/preconditions/trackable';
import open from 'open';
import {AuthenticatedClient} from '../../../../lib/platform/authenticatedClient';
import {createSnapshotUrl} from '../../../../lib/platform/url';
import dedent from 'ts-dedent';

export default class Create extends Command {
  public static description = '(beta) Create a Snapshot Pull Model';

  @Trackable({eventName: 'org resources pull - new model'})
  @Preconditions(IsAuthenticated())
  public async run() {
    this.warn(
      'The org:resources commands are currently in public beta, please report any issue to github.com/coveo/cli/issues'
    );
    await this.openPlatform();
    this
      .log(dedent`Make sure to save the resulting snapshot pull model, so you can later run
    "org:resources:pull -m <path/to/snapshot/pull/model.json>" to create a snapshot of the target resources in your organization.`);
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
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }
}
