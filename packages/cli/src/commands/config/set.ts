import {Command, flags} from '@oclif/command';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../hooks/analytics/analytics';
import {Config} from '../../lib/config/config';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {
  IsAuthenticated,
  Preconditions,
} from '../../lib/decorators/preconditions';
import {
  PlatformEnvironment,
  PlatformRegion,
} from '../../lib/platform/environment';

export default class Set extends Command {
  public static description = 'Modify the current configuration.';

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
      description:
        'The Coveo Platform region inside which to perform operations. See <https://docs.coveo.com/en/2976>.',
    }),
    environment: flags.string({
      char: 'e',
      options: ['dev', 'qa', 'prod', 'hipaa'],
      description:
        'The Coveo Platform environment inside which to perform operations.',
    }),
    organization: flags.string({
      char: 'o',
      description:
        'The identifier of the organization inside which to perform operations. See <https://docs.coveo.com/en/1562/#organization-id-and-other-information>.',
      helpValue: 'myOrgID',
    }),
    analytics: flags.string({
      char: 'a',
      options: ['y', 'n'],
      description: 'Whether to enable analytics and telemetry tracking.',
    }),
  };

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(Set);
    const cfg = new Config(this.config.configDir, this.error);
    if (flags.environment) {
      cfg.set('environment', flags.environment as PlatformEnvironment);
    }
    if (flags.organization) {
      await this.verifyOrganization(flags.organization);
      cfg.set('organization', flags.organization);
    }
    if (flags.region) {
      cfg.set('region', flags.region as PlatformRegion);
    }
    if (flags.analytics) {
      cfg.set('analyticsEnabled', flags.analytics === 'y');
    }
    await this.config.runHook(
      'analytics',
      buildAnalyticsSuccessHook(this, flags)
    );
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(Set);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private async verifyOrganization(org: string) {
    const hasAccess = await new AuthenticatedClient().getUserHasAccessToOrg(
      org
    );
    if (!hasAccess) {
      this.error(
        `You either don't have access to organization ${org}, or it doesn't exist.`
      );
    }
  }
}
