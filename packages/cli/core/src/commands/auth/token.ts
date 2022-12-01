import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags} from '@oclif/core';
import {Config} from '@coveo/cli-commons/config/config';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {PlatformEnvironment} from '@coveo/cli-commons/platform/environment';
import {Region} from '@coveo/platform-client';
import {withEnvironment, withRegion} from '../../lib/flags/platformCommonFlags';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {formatOrgId} from '@coveo/cli-commons/utils/ux';

export default class Token extends CLICommand {
  private configuration!: Config;
  public static description =
    'Log in to the Coveo Platform using an access token.';

  public static examples = ['$ coveo auth:token'];

  public static flags = {
    ...withRegion(),
    ...withEnvironment(),
    token: Flags.string({
      char: 't',
      description:
        'The API-Key that shall be used to authenticate you to the organization. See <https://github.com/coveo/cli/wiki/Using-the-CLI-using-an-API-Key>.',
      required: true,
      helpValue: 'xxx-api-key',
    }),
  };

  @Trackable({eventName: 'auth login token'})
  public async run() {
    this.configuration = new Config(this.config.configDir);
    await this.saveToken();
    await this.saveRegionAndEnvironment();
    await this.fetchAndSaveOrgId();
    this.feedbackOnSuccessfulLogin();
  }

  private feedbackOnSuccessfulLogin() {
    const cfg = this.configuration.get();
    this.log(`
    Successfully logged in!
    Close your browser to continue.

    You are currently logged in:
    Organization: ${formatOrgId(cfg.organization)}
    Region: ${cfg.region}
    Environment: ${cfg.environment}
    Run auth:login --help to see the available options to log in to a different organization, region, or environment.
    `);
  }

  private async saveToken() {
    const {flags} = await this.parse(Token);
    this.configuration.set('accessToken', flags.token);
    this.configuration.set('anonymous', true);
  }

  private async saveRegionAndEnvironment() {
    const {flags} = await this.parse(Token);
    const cfg = this.configuration;
    cfg.set('environment', flags.environment as PlatformEnvironment);
    cfg.set('region', flags.region as Region);
  }

  private async fetchAndSaveOrgId() {
    this.configuration.set(
      'organization',
      await this.pickFirstAvailableOrganization()
    );
  }

  private async pickFirstAvailableOrganization() {
    const orgs = await new AuthenticatedClient().getAllOrgsUserHasAccessTo();
    return orgs[0]?.id;
  }
}
