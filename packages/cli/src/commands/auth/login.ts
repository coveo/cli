import {Command, flags} from '@oclif/command';
import {Config} from '../../lib/config/config';
import {OAuth} from '../../lib/oauth/oauth';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {
  PlatformEnvironment,
  PlatformRegion,
} from '../../lib/platform/environment';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../hooks/analytics/analytics';

export default class Login extends Command {
  private configuration!: Config;
  public static description =
    'Log into the Coveo platform using the OAuth2 flow.';

  public static examples = ['$ coveo auth:login'];

  public static flags = {
    region: flags.string({
      char: 'r',
      options: [
        'us-east-1',
        'eu-west-1',
        'eu-west-3',
        'ap-southeast-2',
        'us-west-2',
      ],
      default: 'us-east-1',
      description:
        'The platform region to log into. See https://docs.coveo.com/en/2976.',
    }),
    environment: flags.string({
      char: 'e',
      options: ['dev', 'qa', 'prod', 'hipaa'],
      default: 'prod',
      description: 'The Coveo platform environment to log into.',
    }),
    organization: flags.string({
      char: 'o',
      description:
        'The identifier of the organization to log into. If not specified, the CLI logs you in the first organization available. See also commands config:get, config:set, and org:list.',
      helpValue: 'myOrgID',
    }),
  };

  public async run() {
    this.configuration = new Config(this.config.configDir, this.error);
    await this.loginAndPersistToken();
    await this.persistRegionAndEnvironment();
    await this.verifyOrganization();
    await this.persistOrganization();
    await this.feedbackOnSuccessfulLogin();
    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  public async catch(err?: Error) {
    const flags = this.flags;
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private async feedbackOnSuccessfulLogin() {
    const cfg = await this.configuration.get();
    this.log(`
    Successfully logged in !
    Close your browser to continue

    You are currently logged in:
    Organization: ${cfg.organization}
    Region: ${cfg.region}
    Environment: ${cfg.environment}
    Run auth:login --help to see available options to log into a different organization, region or environment.
    `);
  }

  private async loginAndPersistToken() {
    const flags = this.flags;
    const {accessToken} = await new OAuth({
      environment: flags.environment as PlatformEnvironment,
      region: flags.region as PlatformRegion,
    }).getToken();
    await this.configuration.set('accessToken', accessToken);
  }

  private async persistRegionAndEnvironment() {
    const flags = this.flags;
    const cfg = this.configuration;
    await cfg.set('environment', flags.environment as PlatformEnvironment);
    await cfg.set('region', flags.region as PlatformRegion);
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

    this.error('You have no access to any Coveo organization!');
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
          `You either do not have access to organization ${flags.organization}, or it does not exists.`
        );
      }
    }

    const orgs = await authenticatedClient.getAllOrgsUserHasAccessTo();

    if (orgs.length === 0) {
      this.error(`
      You do not have access to any Coveo organization in this region and environment.
      Please make sure to you have access to at least one Coveo Organization, and that you are targeting the correct region and environment.
      Run auth:login --help to see available options to log into a different organization, region or environment.
      `);
    }
  }
}
