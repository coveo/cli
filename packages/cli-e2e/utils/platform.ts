import axios from 'axios';
import {HTTPRequest} from 'puppeteer';

export function isSearchRequest(request: HTTPRequest) {
  return request.url().startsWith(`${hostname()}search/v2?organizationId`);
}

export async function createOrg(
  name: string,
  accessToken: string,
  organizationTemplate = 'Developer'
): Promise<string> {
  const request = await axios.post(
    `${hostname()}organizations?name=${name}&organizationTemplate=${organizationTemplate}`,
    {},
    authHeader(accessToken)
  );

  return request.data.id;
}

export async function deleteOrg(orgId: string, accessToken: string) {
  if (orgId === 'connectorsteamtestsmf76kcam') {
    throw new Error('Au bûcher! Au bûcher!');
  }
  // await axios.delete(
  //   `${hostname()}organizations/${orgId}`,
  //   authHeader(accessToken)
  // );
}

function hostname() {
  // TODO: CDX-98: URL should vary in function of the target environment.
  return 'https://platformdev.cloud.coveo.com/rest/';
}

function authHeader(accessToken: string) {
  return {
    headers: {Authorization: `Bearer ${accessToken}`},
  };
}
