import {Command, flags} from '@oclif/command';
import {Config} from '../../lib/config/config';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {
  PlatformEnvironment,
  PlatformRegion,
} from '../../lib/platform/environment';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../hooks/analytics/analytics';

export default class Token extends Command {
  private configuration!: Config;
  public static description =
    'Log in to the Coveo Platform using the OAuth2 flow.';

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
        'The Coveo Platform region to log in to. See <https://docs.coveo.com/en/2976>.',
    }),
    environment: flags.string({
      char: 'e',
      options: ['dev', 'qa', 'prod', 'hipaa'],
      default: 'prod',
      description: 'The Coveo Platform environment to log in to.',
    }),
    token: flags.string({
      char: 't',
      description:
        'The API-Key that shall be used to authenticate you to the organization. See <TODO-DOC> for more details on how to create the API-Key and the required permissions.',
      required: true,
    }),
  };

  public async run() {
    this.configuration = new Config(this.config.configDir, this.error);
    this.loginAndPersistToken();
    this.persistRegionAndEnvironment();
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

  private loginAndPersistToken() {
    const flags = this.flags;
    this.configuration.set('accessToken', flags.token);
  }

  private persistRegionAndEnvironment() {
    const flags = this.flags;
    const cfg = this.configuration;
    cfg.set('environment', flags.environment as PlatformEnvironment);
    cfg.set('region', flags.region as PlatformRegion);
  }

  private async persistOrganization() {
    this.configuration.set(
      'organization',
      await this.pickFirstAvailableOrganization()
    );
  }

  private get flags() {
    const {flags} = this.parse(Token);
    return flags;
  }

  private async pickFirstAvailableOrganization() {
    const orgs = await new AuthenticatedClient().getAllOrgsUserHasAccessTo();
    return orgs[0]?.id;
  }
}
