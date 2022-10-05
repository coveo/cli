import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags} from '@oclif/core';
import {Config} from '@coveo/cli-commons/config/config';
import {OAuth} from '../../lib/oauth/oauth';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {PlatformEnvironment} from '@coveo/cli-commons/platform/environment';
import {Region} from '@coveo/platform-client';
import {withEnvironment, withRegion} from '../../lib/flags/platformCommonFlags';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {formatOrgId} from '@coveo/cli-commons/utils/ux';

export default class Login extends CLICommand {
  private configuration!: Config;
  public static description =
    'Log in to the Coveo Platform using the OAuth2 flow.';

  public static examples = ['$ coveo auth:login'];

  public static flags = {
    ...withRegion(),
    ...withEnvironment(),
    organization: Flags.string({
      char: 'o',
      description:
        'The identifier of the organization to log in to. If not specified, the CLI logs you in to the first available organization. See also commands `config:get`, `config:set`, and `org:list`.',
      helpValue: 'myOrgID',
    }),
  };

  @Trackable({eventName: 'auth login - browser'})
  public async run() {
    this.configuration = new Config(this.config.configDir);
    await this.loginAndPersistToken();
    await this.persistRegionAndEnvironment();
    await this.verifyOrganization();
    await this.persistOrganization();
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

  private async loginAndPersistToken() {
    const {flags} = await this.parse(Login);
    const {accessToken} = await new OAuth({
      environment: flags.environment as PlatformEnvironment,
      region: flags.region as Region,
    }).getToken();
    this.configuration.set('accessToken', accessToken);
    this.configuration.set('anonymous', false);
  }

  private async persistRegionAndEnvironment() {
    const {flags} = await this.parse(Login);
    const cfg = this.configuration;
    cfg.set('environment', flags.environment as PlatformEnvironment);
    cfg.set('region', flags.region as Region);
  }

  private async persistOrganization() {
    const {flags} = await this.parse(Login);
    const cfg = this.configuration;

    if (flags.organization) {
      cfg.set('organization', flags.organization);
      return;
    }

    const firstOrgAvailable = await this.pickFirstAvailableOrganization();
    if (firstOrgAvailable) {
      cfg.set('organization', firstOrgAvailable);
      return;
    }

    this.error('You have no access to any Coveo organization.');
  }

  private async pickFirstAvailableOrganization() {
    const orgs = await new AuthenticatedClient().getAllOrgsUserHasAccessTo();
    return orgs[0]?.id;
  }

  private async verifyOrganization() {
    const {flags} = await this.parse(Login);
    const authenticatedClient = new AuthenticatedClient();

    if (flags.organization) {
      const hasAccess = await authenticatedClient.getUserHasAccessToOrg(
        flags.organization
      );
      if (!hasAccess) {
        this.error(
          `You either don't have access to organization ${formatOrgId(
            flags.organization
          )}, or it doesn't exist.`
        );
      }
    }

    const orgs = await authenticatedClient.getAllOrgsUserHasAccessTo();

    if (orgs.length === 0) {
      this.error(`
      You don't have access to any Coveo organization in this region and environment.
      Ensure that you have access to at least one Coveo organization, and that you're targeting the correct region and environment.
      Run auth:login --help to see the available options to log in to a different organization, region or environment.
      `);
    }
  }
}
