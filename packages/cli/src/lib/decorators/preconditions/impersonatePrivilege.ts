import Command from '@oclif/command';
import {AuthenticatedClient} from '../../platform/authenticatedClient';

export function hasImpersonatePrivilege() {
  return async function (target: Command) {
    const authenticatedClient = new AuthenticatedClient();
    const userInfo = await authenticatedClient.getUserInfo();
    const client = await authenticatedClient.getClient();
    const organizationMembers = await client.organization.members.getAll();
    const groupsUserIsPartOf =
      organizationMembers.find((member) => member.email === userInfo.email)
        ?.groups || [];

    const impersonatePrivilege = {
      targetDomain: 'IMPERSONATE',
      targetId: '*',
      owner: 'SEARCH_API',
    };

    for (const group of groupsUserIsPartOf) {
      const groupPrivileges = await client.group.listExclusivePrivileges(
        group.id
      );
      const hasImpersonatePrivilege = groupPrivileges.some((p) => {
        return JSON.stringify(p) === JSON.stringify(impersonatePrivilege);
      });
      if (hasImpersonatePrivilege) {
        return true;
      }
    }
    // TODO: better message
    // TODO: add specs
    target.warn('Hey! You need impersonate Privilege!!');
    return false;
  };
}
