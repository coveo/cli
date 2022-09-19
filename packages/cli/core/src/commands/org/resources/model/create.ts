import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import open from 'open';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {createSnapshotUrl} from '@coveo/cli-commons/platform/url';
import dedent from 'ts-dedent';

export default class Create extends CLICommand {
  public static description = 'Create a Snapshot Pull Model';

  @Trackable({eventName: 'org resources pull - new model'})
  @Preconditions(IsAuthenticated())
  public run() {
    this.openPlatform();
    this
      .log(dedent`Make sure to save the resulting snapshot pull model, so you can later run
    "org:resources:pull -m <path/to/snapshot/pull/model.json>" to create a snapshot of the target resources in your organization.`);
    return Promise.resolve();
  }

  private openPlatform() {
    const url = this.getPlatformUrl();
    open(url);
  }

  private getPlatformUrl() {
    const cfg = new AuthenticatedClient().cfg.get();
    return createSnapshotUrl(cfg.organization, {
      environment: cfg.environment,
      region: cfg.region,
    });
  }
}
