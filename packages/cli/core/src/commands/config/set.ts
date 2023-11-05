import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Config} from '@coveo/cli-commons/config/config';
import {ConfigRenderer} from '@coveo/cli-commons/config/configRenderer';
import {Before} from '@coveo/cli-commons/decorators/before';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {IsAuthenticated} from '@coveo/cli-commons/preconditions/index';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {Flags} from '@oclif/core';
import type {Example} from '@oclif/core/lib/interfaces';
import {InvalidCommandError} from '../../lib/errors/InvalidCommandError';

export default class Set extends CLICommand {
  public static description = 'Modify the current Coveo CLI configuration.';

  public static flags = {
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
  @Before(IsAuthenticated())
  public async run() {
    const {flags} = await this.parse(Set);
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
