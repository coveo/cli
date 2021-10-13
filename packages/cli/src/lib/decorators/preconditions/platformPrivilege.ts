import {PrivilegeModel} from '@coveord/platform-client';

export interface PlatformPrivilege {
  model: PrivilegeModel[];
  unsatisfiedConditionMessage: (anonymous: boolean) => string;
}

export const createApiKeyPrivilege: PlatformPrivilege = {
  model: [
    {
      owner: 'PLATFORM',
      targetDomain: 'API_KEY',
      targetId: '*',
      type: 'CREATE',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? 'Your API key is missing the privilege to create other API keys. Make sure to grant this privilege before running the command again. See https://docs.coveo.com/en/1707/#api-keys-domain.'
      : 'You are not authorized to create an API Key. Please contact an administrator of your Coveo organization and ask for that privilege. See https://docs.coveo.com/en/1707/#api-keys-domain.',
};

export const impersonatePrivilege: PlatformPrivilege = {
  model: [
    {
      owner: 'SEARCH_API',
      targetDomain: 'IMPERSONATE',
      targetId: '*',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? `Your API key is missing the Impersonate privilege. Make sure to grant this privilege to your API key before running the command again.
See https://docs.coveo.com/en/1707/#impersonate-domain-1.`
      : 'You are not authorized to create an API Key with the Impersonate privilege. Please contact an administrator of your Coveo organization and ask for that privilege.  See https://docs.coveo.com/en/1707/#impersonate-domain-1.',
};

export const createSnapshotPrivilege: PlatformPrivilege = {
  model: [
    {
      type: 'VIEW',
      targetDomain: 'SNAPSHOTS',
      targetId: '*',
      owner: 'PLATFORM',
    },
    {
      type: 'EDIT',
      targetDomain: 'SNAPSHOTS',
      targetId: '*',
      owner: 'PLATFORM',
    },
    {
      type: 'CREATE',
      targetDomain: 'SNAPSHOTS',
      targetId: '*',
      owner: 'PLATFORM',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? 'TODO: anonymous error message'
      : 'TODO: not anonymous error message',
};
