import PlatformClient, {
  PrivilegeEvaluatorModel,
  PrivilegeModel,
} from '@coveord/platform-client';
import Command from '@oclif/command';
import {Config} from '../../config/config';
import {AuthenticatedClient} from '../../platform/authenticatedClient';
import {PlatformPrivilege} from './platformPrivilege';

export function HasNecessaryCoveoPrivileges(
  ...privileges: PlatformPrivilege[]
) {
  return async function (target: Command) {
    const authenticatedClient = new AuthenticatedClient();
    const client = await authenticatedClient.getClient();
    const {organization, anonymous} = await getConfiguration(target);

    for (let i = 0; i < privileges.length; i++) {
      const privilege = privileges[i];

      for (let j = 0; j < privilege.model.length; j++) {
        const model = privilege.model[j];
        if (!(await hasPrivilege(client, organization, model))) {
          target.warn(
            privilege.unsatisfiedConditionMessage(Boolean(anonymous))
          );
          return false;
        }
      }
    }

    return true;
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
  return validation.approved;
}

async function getConfiguration(target: Command) {
  const config = new Config(global.config.configDir, target.error);
  return config.get();
}
