import {Command, Flags} from '@oclif/core';
import {Config} from '../../lib/config/config';
import {OAuth} from '../../lib/oauth/oauth';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {PlatformEnvironment} from '../../lib/platform/environment';
import {Region} from '@coveord/platform-client';
import {withEnvironment, withRegion} from '../../lib/flags/platformCommonFlags';
import {Trackable} from '../../lib/decorators/preconditions/trackable';

export default class Login extends Command {
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

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private feedbackOnSuccessfulLogin() {
    const cfg = this.configuration.get();
    this.log(`
    Successfully logged in!
    Close your browser to continue.

    You are currently logged in:
    Organization: ${cfg.organization}
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
    await cfg.set('environment', flags.environment as PlatformEnvironment);
    await cfg.set('region', flags.region as Region);
  }

  private async persistOrganization() {
    const {flags} = await this.parse(Login);
    const cfg = this.configuration;

    if (flags.organization) {
      await cfg.set('organization', flags.organization);
      return;
    }

    const firstOrgAvailable = await this.pickFirstAvailableOrganization();
    if (firstOrgAvailable) {
      await cfg.set('organization', firstOrgAvailable as string);
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
          `You either don't have access to organization ${flags.organization}, or it doesn't exist.`
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
