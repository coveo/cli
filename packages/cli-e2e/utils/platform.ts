import axios from 'axios';
import {HTTPRequest} from 'puppeteer';

// TODO: CDX-98: URL should vary in function of the target environment.
export const platformHost = 'https://platformdev.cloud.coveo.com/rest/';

export async function listPlatformResource(
  resourceUrl: string,
  accessToken: string
) {
  const request = await axios.get(resourceUrl, authHeader(accessToken));
  return request.data;
}

export async function listExtensions(orgId: string, accessToken: string) {
  return listPlatformResource(
    `${platformHost}organizations/${orgId}/extensions`,
    accessToken
  );
}

export async function listFields(orgId: string, accessToken: string) {
  return listPlatformResource(
    `${platformHost}organizations/${orgId}/indexes/page/fields`,
    accessToken
  );
}

export function isSearchRequest(request: HTTPRequest) {
  return request.url().startsWith(`${platformHost}search/v2?organizationId`);
}

export async function createOrg(
  name: string,
  accessToken: string,
  organizationTemplate = 'Developer'
): Promise<string> {
  const request = await axios.post(
    `${platformHost}organizations?name=${name}&organizationTemplate=${organizationTemplate}`,
    {},
    authHeader(accessToken)
  );

  return request.data.id;
}

function authHeader(accessToken: string) {
  return {
    headers: {Authorization: `Bearer ${accessToken}`},
  };
}

async function main() {
  const fields = await listFields(
    'climanualtestt26l2cxv',
    'xxfeb40f1d-5d8a-4516-95a5-f518348a0f62'
  );
  console.log('*********************');
  console.log(fields);
  console.log('*********************');
}

main();
