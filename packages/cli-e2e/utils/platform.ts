import axios from 'axios';
import {HTTPRequest} from 'puppeteer';

// TODO: CDX-98: URL should vary in function of the target environment.
export const platformHost = 'https://platformdev.cloud.coveo.com/rest/';

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
