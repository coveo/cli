import PlatformClient, {
  PrivilegeEvaluatorModel,
} from '@coveord/platform-client';
import Command from '@oclif/command';
import {Config} from '../../config/config';
import {AuthenticatedClient} from '../../platform/authenticatedClient';

export const impersonatePrivilege = {
  requestedPrivilege: {
    owner: 'SEARCH_API',
    targetDomain: 'IMPERSONATE',
    targetId: '*',
  },
};

export const createApiKeyPrivilege = {
  requestedPrivilege: {
    owner: 'PLATFORM',
    targetDomain: 'API_KEY',
    targetId: '*',
    type: 'CREATE',
  },
};

export function HasNecessaryCoveoPrivileges() {
  return async function (target: Command) {
    const authenticatedClient = new AuthenticatedClient();

    const client = await authenticatedClient.getClient();
    const {organization} = await getConfiguration(target);

    if (!(await hasCreateApiKeyPrivilege(client, organization))) {
      // TODO: better message
      target.warn('You cannot create an API Key');
      return false;
    }
    if (!(await hasImpersonatePrivilege(client, organization))) {
      // TODO: better message
      target.warn('You cannot create an API Key with impersonate privilege');
      return false;
    }
    return true;
  };
}

async function hasImpersonatePrivilege(
  client: PlatformClient,
  organizationId: string
) {
  const model: PrivilegeEvaluatorModel = {
    ...impersonatePrivilege,
    organizationId,
  };

  return await hasPrivilege(client, model);
}

async function hasCreateApiKeyPrivilege(
  client: PlatformClient,
  organizationId: string
) {
  const model: PrivilegeEvaluatorModel = {
    ...createApiKeyPrivilege,
    organizationId,
  };

  return await hasPrivilege(client, model);
}

async function hasPrivilege(
  client: PlatformClient,
  model: PrivilegeEvaluatorModel
) {
  const validation = await client.privilegeEvaluator.evaluate(model);
  return validation.approved;
}

async function getConfiguration(target: Command) {
  const config = new Config(global.config.configDir, target.error);
  return config.get();
}
