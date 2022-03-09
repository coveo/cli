import PlatformClient, {
  PrivilegeEvaluatorModel,
  PrivilegeModel,
} from '@coveord/platform-client';
import Command from '@oclif/command';
import {cli} from 'cli-ux';
import {Config} from '../../config/config';
import {
  PreconditionError,
  PreconditionErrorCategory,
} from '../../errors/preconditionError';
import {AuthenticatedClient} from '../../platform/authenticatedClient';
import {PlatformPrivilege} from './platformPrivilege';

export function HasNecessaryCoveoPrivileges(
  ...privileges: PlatformPrivilege[]
) {
  return async function (
    this: Command,
    command: Command
  ): Promise<void | never> {
    const {flags} = hasFlagProperty(this)
      ? {flags: this.flags}
      : this.parse(command.ctor);
    const authenticatedClient = new AuthenticatedClient();
    const client = await authenticatedClient.getClient();
    const {organization: target, anonymous} = await getConfiguration();
    const organization = flags.target || target;

    const promises = privileges.flatMap((privilege) =>
      privilege.models.map(async (model) => {
        if (!(await hasPrivilege(client, organization, model))) {
          const message = privilege.unsatisfiedConditionMessage(
            Boolean(anonymous)
          );
          throw new PreconditionError(message, {
            category: PreconditionErrorCategory.MissingPlatformPrivilege,
          });
        }
      })
    );

    await Promise.all(promises);
  };
}

function hasFlagProperty(
  candidate: any
): candidate is Command & {flags: {target: string}} {
  return Boolean(candidate?.flags?.target);
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
  const config = new Config(global.config.configDir, cli.error);
  return config.get();
}
