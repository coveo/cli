import PlatformClient, {
  PrivilegeEvaluatorModel,
  PrivilegeModel,
} from '@coveord/platform-client';
import {Command} from '@oclif/core';
import {Config} from '../../config/config';
import globalConfig from '../../config/globalConfig';
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
    const {flags} = await this.parse(command.ctor);
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

async function hasPrivilege(
  client: PlatformClient,
  organizationId: string,
  privilege: PrivilegeModel
) {
  // TODO: CDX-811: the privilege evaluation does not work on dev environment
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
