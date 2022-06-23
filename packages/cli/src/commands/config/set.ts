import {CliUx, Command, Flags} from '@oclif/core';
import {Config} from '../../lib/config/config';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {
  IsAuthenticated,
  Preconditions,
} from '../../lib/decorators/preconditions';
import {Trackable} from '../../lib/decorators/preconditions/trackable';
import {InvalidCommandError} from '../../lib/errors/InvalidCommandError';
import {ConfigRenderer} from '../../lib/config/configRenderer';

export default class Set extends Command {
  public static description = 'Modify the current configuration.';

  public static flags = {
    environment: Flags.string({
      char: 'e',
      hidden: true,
    }),
    region: Flags.string({
      char: 'r',
      hidden: true,
    }),
    organization: Flags.string({
      char: 'o',
      description:
        'The identifier of the organization inside which to perform operations. See <https://docs.coveo.com/en/1562/#organization-id-and-other-information>.',
      helpValue: 'myOrgID',
    }),
    analytics: Flags.string({
      char: 'a',
      options: ['y', 'n'],
      description: 'Whether to enable analytics and telemetry tracking.',
    }),
  };

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = await this.parse(Set);
    if (flags.environment || flags.region) {
      CliUx.ux.error(
        'To connect to a different region or environment, use the `auth:login` command'
      );
    }
    if (Object.entries(flags).length === 0) {
      throw new InvalidCommandError('Command should contain at least 1 flag');
    }
    const cfg = new Config(this.config.configDir);
    if (flags.organization) {
      await this.verifyOrganization(flags.organization);
      cfg.set('organization', flags.organization);
    }
    if (flags.analytics) {
      cfg.set('analyticsEnabled', flags.analytics === 'y');
    }

    ConfigRenderer.render(cfg);
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
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
