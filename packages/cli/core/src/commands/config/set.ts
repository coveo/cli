import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {CliUx, Flags} from '@oclif/core';
import {Config} from '@coveo/cli-commons/config/config';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {InvalidCommandError} from '../../lib/errors/InvalidCommandError';
import {ConfigRenderer} from '@coveo/cli-commons/config/configRenderer';
import type {Example} from '@oclif/core/lib/interfaces';

export default class Set extends CLICommand {
  public static description = 'Modify the current Coveo CLI configuration.';

  public static flags = {
    // TODO CDX-1246
    environment: Flags.string({
      char: 'e',
      hidden: true,
    }),
    // TODO CDX-1246
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
  };

  public static examples: Example[] = [
    {
      command: 'coveo config:set --organization myOrgId',
      description: 'connect to a different organization',
    },
  ];

  @Trackable()
  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = await this.parse(Set);
    // TODO CDX-1246
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

    ConfigRenderer.render(cfg);
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
