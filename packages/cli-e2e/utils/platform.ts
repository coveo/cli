require('isomorphic-fetch');
require('abortcontroller-polyfill');

import PlatformClient from '@coveord/platform-client';
import axios from 'axios';
import {HTTPRequest} from 'puppeteer';

export const platformHost = process.env.PLATFORM_HOST;

export function getPlatformClient(organizationId: string, accessToken: string) {
  return new PlatformClient({
    host: platformHost,
    organizationId,
    accessToken,
  });
}

export function isSearchRequest(request: HTTPRequest) {
  const searchUrl = new URL('/rest/search/v2?organizationId', platformHost);
  return request.url().startsWith(searchUrl.href);
}

export async function createOrg(
  name: string,
  accessToken: string,
  organizationTemplate = 'Developer'
): Promise<string> {
  const url = new URL(
    `rest/organizations?name=${name}&organizationTemplate=${organizationTemplate}`,
    platformHost
  );
  const request = await axios.post(url.href, {}, authHeader(accessToken));

  return request.data.id;
}

function authHeader(accessToken: string) {
  return {
    headers: {Authorization: `Bearer ${accessToken}`},
  };
}
