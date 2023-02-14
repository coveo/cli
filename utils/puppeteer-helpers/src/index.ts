import type {HTTPRequest, HTTPResponse} from 'puppeteer';

// TODO: Refactor when implementing into coveo/cli
// Copy from https://github.com/coveo/cli/blob/07b6c64ac76e6e508a44ad932dd9569d66561c9f/packages/cli-e2e/utils/platform.ts#L20-L21
export function isSearchRequestOrResponse(
  requestOrResponse: HTTPRequest | HTTPResponse
) {
  const searchUrl = new URL(
    '/rest/search/v2?organizationId',
    'https://platform.cloud.coveo.com'
  );
  return requestOrResponse.url().startsWith(searchUrl.href);
}
