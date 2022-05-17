import {PrivilegeModel} from '@coveord/platform-client';

export interface PlatformPrivilege {
  models: PrivilegeModel[];
  unsatisfiedConditionMessage: (anonymous: boolean) => string;
}

export const createApiKeyPrivilege: PlatformPrivilege = {
  models: [
    {
      owner: 'PLATFORM',
      targetDomain: 'API_KEY',
      targetId: '*',
      type: 'CREATE',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? 'Your access token is missing the privilege to create API keys. Make sure to grant this privilege before running the command again. See https://docs.coveo.com/en/1707/#api-keys-domain.'
      : 'You are not authorized to create an API Key. Please contact an administrator of your Coveo organization and ask for that privilege. See https://docs.coveo.com/en/1707/#api-keys-domain.',
};

export const impersonatePrivilege: PlatformPrivilege = {
  models: [
    {
      owner: 'SEARCH_API',
      targetDomain: 'IMPERSONATE',
      targetId: '*',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? `Your access token is missing the Impersonate privilege. Make sure to grant this privilege to your API key before running the command again.
See https://docs.coveo.com/en/1707/#impersonate-domain-1.`
      : 'You are not authorized to create an API Key with the Impersonate privilege. Please contact an administrator of your Coveo organization and ask for that privilege.  See https://docs.coveo.com/en/1707/#impersonate-domain-1.',
};

export const readSnapshotPrivilege: PlatformPrivilege = {
  models: [
    {
      type: 'VIEW',
      targetDomain: 'SNAPSHOTS',
      targetId: '*',
      owner: 'PLATFORM',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? `Your API key doesn't have the privilege to view snapshots. Make sure to grant this privilege to your API key before running the command again
See https://docs.coveo.com/en/3357.`
      : `You are not authorized to view snapshots. Make sure you are granted this privilege before running the command again.
See https://docs.coveo.com/en/3357.`,
};

export const writeSnapshotPrivilege: PlatformPrivilege = {
  models: [
    ...readSnapshotPrivilege.models,
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
      ? `Your API key doesn't have the privilege to create snapshots. Make sure to grant this privilege to your API key before running the command again
See https://docs.coveo.com/en/3357.`
      : `You are not authorized to create snapshots. Make sure you are granted this privilege before running the command again.
See https://docs.coveo.com/en/3357.`,
};

export const readLinkPrivilege: PlatformPrivilege = {
  models: [
    {
      type: 'VIEW',
      targetDomain: 'LINK',
      targetId: '*',
      owner: 'PLATFORM',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? `Your API key doesn't have the privilege to read synchronization plans. Make sure to grant this privilege to your API key before running the command again
See https://docs.coveo.com/en/3357.`
      : `You are not authorized to view synchronization plans. Make sure you are granted this privilege before running the command again.
      See https://docs.coveo.com/en/3357.`,
};

export const writeLinkPrivilege: PlatformPrivilege = {
  models: [
    ...readLinkPrivilege.models,
    {
      type: 'EDIT',
      targetDomain: 'LINK',
      targetId: '*',
      owner: 'PLATFORM',
    },
    {
      type: 'CREATE',
      targetDomain: 'LINK',
      targetId: '*',
      owner: 'PLATFORM',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? `Your API key doesn't have the privilege to create synchronization plans. Make sure to grant this privilege to your API key before running the command again
See https://docs.coveo.com/en/3357.`
      : `You are not authorized to create synchronization plans. Make sure you are granted this privilege before running the command again.
See https://docs.coveo.com/en/3357.`,
};

export const readFieldsPrivilege: PlatformPrivilege = {
  models: [
    ...readLinkPrivilege.models,
    {
      type: 'VIEW',
      targetDomain: 'FIELD',
      targetId: '*',
      owner: 'PLATFORM',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? `Your API key doesn't have the privilege to view fields and their configuration. Make sure to grant this privilege to your API key before running the command again.
      See https://docs.coveo.com/en/1707#fields-domain`
      : `You are not authorized to view fields and their configuration. Make sure you are granted this privilege before running the command again.
      See https://docs.coveo.com/en/1707#fields-domain`,
};

export const writeFieldsPrivilege: PlatformPrivilege = {
  models: [
    ...readFieldsPrivilege.models,
    {
      type: 'CREATE',
      targetDomain: 'FIELD',
      targetId: '*',
      owner: 'PLATFORM',
    },
    {
      type: 'EDIT',
      targetDomain: 'FIELD',
      targetId: '*',
      owner: 'PLATFORM',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? `Your API key doesn't have the privilege to create or update fields. Make sure to grant this privilege to your API key before running the command again.
      See https://docs.coveo.com/en/1707#fields-domain`
      : `You are not authorized to create or update fields. Make sure you are granted this privilege before running the command again.
      See https://docs.coveo.com/en/1707#fields-domain`,
};

export const writeSourceContentPrivilege: PlatformPrivilege = {
  models: [
    {
      type: 'CREATE',
      targetDomain: 'SOURCE',
      targetId: '*',
      owner: 'PLATFORM',
    },
    {
      type: 'EDIT',
      targetDomain: 'SOURCE',
      targetId: '*',
      owner: 'PLATFORM',
    },
    {
      type: 'VIEW',
      targetDomain: 'SOURCE',
      targetId: '*',
      owner: 'PLATFORM',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? `Your API key doesn't have the privilege to edit sources. Make sure to grant this privilege to your API key before running the command again.
      See https://docs.coveo.com/en/1707#sources-domain`
      : `You are not authorized to edit sources. Make sure you are granted this privilege before running the command again.
      See https://docs.coveo.com/en/1707#sources-domain`,
};

export const readOrganizationPrivilege: PlatformPrivilege = {
  models: [
    {
      type: 'VIEW',
      targetDomain: 'ORGANIZATION',
      targetId: '*',
      owner: 'PLATFORM',
    },
  ],
  unsatisfiedConditionMessage: (anonymous: boolean) =>
    anonymous
      ? `Your API key doesn't have the privilege to view the organization. Make sure to grant this privilege to your API key before running the command again.
      See https://docs.coveo.com/en/1707#organization-domain`
      : `You are not authorized to view the organization. Make sure you are granted this privilege before running the command again.
      See https://docs.coveo.com/en/1707#organization-domain`,
};
