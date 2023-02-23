import PlatformClient, {
  PrivilegeEvaluatorModel,
  PrivilegeModel,
} from '@coveo/platform-client';
import {Command, Flags} from '@oclif/core';
import {CLICommand} from '../command/cliCommand';
import {Config} from '../config/config';
import globalConfig from '../config/globalConfig';
import {InvalidCommandError} from '../errors/invalidCommandError';
import {PreconditionError} from '../errors/preconditionError';
import {AuthenticatedClient} from '../platform/authenticatedClient';
import {PlatformPrivilege} from './platformPrivilege';

const PRECONDITION_ERROR_CATEGORY = 'Missing Platform Privilege';

export function HasNecessaryCoveoPrivileges(
  ...privileges: PlatformPrivilege[]
) {
  return async function (
    this: CLICommand,
    command: CLICommand
  ): Promise<void | never> {
    const commandConstructor = command.ctor;
    const flags = hasGetFlagMethod(this)
      ? await this.getFlags()
      : hasOrgFlag(commandConstructor)
      ? (await this.parse(commandConstructor)).flags
      : null;
    const authenticatedClient = new AuthenticatedClient();
    const client = await authenticatedClient.getClient();
    const {organization: target, anonymous} = await getConfiguration();
    const organization = flags?.organization || target;

    const promises = privileges.flatMap((privilege) =>
      privilege.models.map(async (model) => {
        if (!(await hasPrivilege(client, organization, model))) {
          const message = privilege.unsatisfiedConditionMessage(
            Boolean(anonymous)
          );
          throw new PreconditionError(message, {
            category: PRECONDITION_ERROR_CATEGORY,
          });
        }
      })
    );

    await Promise.all(promises);
  };
}

async function hasPrivilege(
  client: PlatformClient,
  organizationId: string,
  privilege: PrivilegeModel
) {
  const model: PrivilegeEvaluatorModel = {
    ...{requestedPrivilege: privilege},
    organizationId,
  };

  const validation = await client.privilegeEvaluator.evaluate(model);
  return Boolean(validation.approved);
}

async function getConfiguration() {
  const config = new Config(globalConfig.get().configDir);
  return config.get();
}

function hasGetFlagMethod(candidate: any): candidate is CLICommand & {
  getFlags: () => Promise<{organization?: string | undefined}>;
} {
  return Boolean(candidate?.getFlags);
}

type CommandWithOrgFlag = typeof Command & {
  flags: {
    organization: ReturnType<(typeof Flags)['string']>;
  };
};

function hasOrgFlag(
  candidate: typeof Command
): candidate is CommandWithOrgFlag {
  return Object.hasOwn(candidate.flags, 'organization');
}
