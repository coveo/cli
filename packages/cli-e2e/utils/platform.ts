import 'fetch-undici-polyfill';
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
  return (
    await new PlatformClient({accessToken}).organization.create({
      name,
      organizationTemplate,
    })
  ).id;
}
