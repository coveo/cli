require('isomorphic-fetch');
require('abortcontroller-polyfill');

import PlatformClient from '@coveo/platform-client';
import {HTTPRequest, HTTPResponse} from 'puppeteer';

export function getPlatformClient(organizationId: string, accessToken: string) {
  return new PlatformClient({
    host: process.env.PLATFORM_HOST,
    organizationId,
    accessToken,
  });
}

export function getPlatformHost(env: string) {
  return `https://platform${env === 'prod' ? '' : env}.cloud.coveo.com`;
}

export function isSearchRequestOrResponse(
  requestOrResponse: HTTPRequest | HTTPResponse
) {
  return (
    requestOrResponse.url().indexOf('/rest/search/v2?organizationId') !== -1
  );
}

export function isSuccessfulSearchResponse(requestOrResponse: HTTPResponse) {
  return (
    isSearchRequestOrResponse(requestOrResponse) &&
    requestOrResponse.status() === 200
  );
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
  return (
    await (
      await fetch(url.href, {
        method: 'POST',
        ...authHeader(accessToken),
      })
    ).json()
  ).id;
}

function authHeader(accessToken: string) {
  return {
    headers: {Authorization: `Bearer ${accessToken}`},
  };
}
