require('isomorphic-fetch');
require('abortcontroller-polyfill');

import PlatformClient from '@coveord/platform-client';
import axios from 'axios';
import {HTTPRequest, HTTPResponse} from 'puppeteer';

export function getPlatformClient(organizationId: string, accessToken: string) {
  return new PlatformClient({
    host: process.env.PLATFORM_HOST,
    organizationId,
    accessToken,
  });
}

export function isSearchRequestOrResponse(
  requestOrResponse: HTTPRequest | HTTPResponse
) {
  const searchUrl = new URL(
    '/rest/search/v2?organizationId',
    process.env.PLATFORM_HOST
  );
  return requestOrResponse.url().startsWith(searchUrl.href);
}

export async function createOrg(
  name: string,
  accessToken: string,
  organizationTemplate = 'Developer'
): Promise<string> {
  const url = new URL(
    `/rest/organizations?name=${name}&organizationTemplate=${organizationTemplate}`,
    process.env.PLATFORM_HOST
  );
  try {
    const request = await axios.post(url.href, {}, authHeader(accessToken));
    return request.data.id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw JSON.stringify(error.response?.data);
    } else {
      throw error;
    }
  }
}

function authHeader(accessToken: string) {
  return {
    headers: {Authorization: `Bearer ${accessToken}`},
  };
}
