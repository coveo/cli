import PlatformClient, {
  PrivilegeEvaluatorModel,
  PrivilegeModel,
} from '@coveord/platform-client';
import Command from '@oclif/command';
import {cli} from 'cli-ux';
import {Config} from '../../config/config';
import {MissingPrivilegeError} from '../../errors/platformError';
import {AuthenticatedClient} from '../../platform/authenticatedClient';
import {PlatformPrivilege} from './platformPrivilege';

export function HasNecessaryCoveoPrivileges(
  ...privileges: PlatformPrivilege[]
) {
  return async function (this: Command, command: Command) {
    const {flags} = this.parse(command.ctor);
    const authenticatedClient = new AuthenticatedClient();
    const client = await authenticatedClient.getClient();
    const {organization: target, anonymous} = await getConfiguration();
    const organization = flags.target || target;

    const promises = privileges.flatMap((privilege) =>
      privilege.models.map(async (model) => {
        if (!(await hasPrivilege(client, organization, model))) {
          throw new MissingPrivilegeError(privilege, anonymous);
        }
      })
    );

    return Boolean(await Promise.all(promises));
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
  const config = new Config(global.config.configDir, cli.error);
  return config.get();
}
