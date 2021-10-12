import {PrivilegeModel} from '@coveord/platform-client';

export interface PlatformPrivilege {
  model: PrivilegeModel[];
  conditionNotSatisfiedMessage: string;
  conditionNotSatisfiedAnonymousMessage: string; // TODO: rename ... too long
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
  conditionNotSatisfiedMessage:
    'You are not authorized to create an API Key. Please contact an administrator of your Coveo organization and ask for that privilege. See https://docs.coveo.com/en/1707/#api-keys-domain.',
  conditionNotSatisfiedAnonymousMessage:
    'Your API key is missing the privilege to create other API keys. Make sure to grant this privilege before running the command again. See https://docs.coveo.com/en/1707/#api-keys-domain.',
};

export const impersonatePrivilege: PlatformPrivilege = {
  model: [
    {
      owner: 'SEARCH_API',
      targetDomain: 'IMPERSONATE',
      targetId: '*',
    },
  ],
  conditionNotSatisfiedMessage:
    'You are not authorized to create an API Key with the Impersonate privilege. Please contact an administrator of your Coveo organization and ask for that privilege.  See https://docs.coveo.com/en/1707/#impersonate-domain-1.',
  conditionNotSatisfiedAnonymousMessage: `Your API key is missing the Impersonate privilege. Make sure to grant this privilege to your API key before running the command again.
  See https://docs.coveo.com/en/1707/#impersonate-domain-1.`,
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
  conditionNotSatisfiedMessage: 'TODO: logged in error message',
  conditionNotSatisfiedAnonymousMessage: 'TODO: anonymous error message',
};
