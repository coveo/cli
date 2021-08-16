import PlatformClient, {
  PrivilegeEvaluatorModel,
} from '@coveord/platform-client';
import Command from '@oclif/command';
import dedent from 'ts-dedent';
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
    const {organization, anonymous} = await getConfiguration(target);

    if (!(await hasCreateApiKeyPrivilege(client, organization))) {
      target.warn(
        anonymous
          ? 'Your API key is missing the privilege to create other API keys. Make sure to grant this privilege before running the command again. See https://docs.coveo.com/en/1707/#api-keys-domain.'
          : 'You are not authorized to create an API Key. Please contact an administrator of your Coveo organization.'
      );
      return false;
    }
    if (!(await hasImpersonatePrivilege(client, organization))) {
      target.warn(
        anonymous
          ? dedent`Your API key is missing the Impersonate privilege. Make sure to grant this privilege to your API key before running the command again.
                   More info here https://docs.coveo.com/en/1707/#impersonate-domain-1`
          : 'You are not authorized to create an API Key with the impersonate privilege. Please contact an administrator of your Coveo organization.'
      );
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
