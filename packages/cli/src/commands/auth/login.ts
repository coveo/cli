import {Command, flags} from '@oclif/command';
import {Config} from '../../lib/config/config';
import {OAuth} from '../../lib/oauth/oauth';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {PlatformEnvironment} from '../../lib/platform/environment';
import {Region} from '@coveord/platform-client';
import {withEnvironment, withRegion} from '../../lib/flags/platformCommonFlags';
import {Trackable} from '../../lib/decorators/preconditions/trackable';
import colors from '../../lib/utils/color-utils';
import {feedbackOnSuccessfulLogin} from '../../lib/login/loginCommon';

export default class Login extends Command {
  private configuration!: Config;
  public static description =
    'Log in to the Coveo Platform using the OAuth2 flow.';

  public static examples = ['$ coveo auth:login'];

  public static flags = {
    ...withRegion(),
    ...withEnvironment(),
    organization: flags.string({
      char: 'o',
      description: `The identifier of the organization to log in to. If not specified, the CLI logs you in to the first available organization. See also commands ${colors.cmd(
        'config:get'
      )}, ${colors.cmd('config:set')}, and ${colors.cmd('org:list')}.`,
      helpValue: 'myOrgID',
    }),
  };

  @Trackable()
  public async run() {
    this.configuration = new Config(this.config.configDir, this.error);
    await this.loginAndPersistToken();
    await this.persistRegionAndEnvironment();
    await this.verifyOrganization();
    await this.persistOrganization();
    await feedbackOnSuccessfulLogin(this.configuration);
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }

  private async loginAndPersistToken() {
    const flags = this.flags;
    const {accessToken} = await new OAuth({
      environment: flags.environment as PlatformEnvironment,
      region: flags.region as Region,
    }).getToken();
    await this.configuration.set('accessToken', accessToken);
  }

  private async persistRegionAndEnvironment() {
    const flags = this.flags;
    const cfg = this.configuration;
    await cfg.set('environment', flags.environment as PlatformEnvironment);
    await cfg.set('region', flags.region as Region);
  }

  private async persistOrganization() {
    const flags = this.flags;
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

  private get flags() {
    const {flags} = this.parse(Login);
    return flags;
  }

  private async verifyOrganization() {
    const flags = this.flags;
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
