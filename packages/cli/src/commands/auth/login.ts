import {Command, flags} from '@oclif/command';
import {Config} from '../../lib/config/config';
import {OAuth} from '../../lib/oauth/oauth';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {
  PlatformEnvironment,
  PlatformRegion,
} from '../../lib/platform/environment';
import {OrganizationModel} from '@coveord/platform-client';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../hooks/analytics/analytics';

export default class Login extends Command {
  private configuration!: Config;
  static description = 'Log into the Coveo platform using the OAuth2 flow.';

  static examples = ['$ coveo auth:login'];

  static flags = {
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

  async run() {
    this.configuration = new Config(this.config.configDir, this.error);
    await this.loginAndPersistToken();
    await this.persistRegionAndEnvironment();
    await this.persistOrganization();

    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  async catch(err?: Error) {
    const flags = this.flags;
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private async loginAndPersistToken() {
    const flags = this.flags;
    const {accessToken} = await new OAuth({
      environment: flags.environment as PlatformEnvironment,
      region: flags.region as PlatformRegion,
    }).getToken();
    this.configuration.set('accessToken', accessToken);
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
      this.log(
        `No organization specified.\nYou are currently logged in ${firstOrgAvailable}.\nIf you wish to specify an organization, use the --organization parameter.`
      );
      return;
    }

    this.log('You have no access to any Coveo organization.');
  }

  private async pickFirstAvailableOrganization() {
    const orgs = await (
      await new AuthenticatedClient().getClient()
    ).organization.list();
    return ((orgs as unknown) as OrganizationModel[])[0]?.id;
  }

  private get flags() {
    const {flags} = this.parse(Login);
    return flags;
  }
}
