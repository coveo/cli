import type {HTTPRequest, HTTPResponse} from 'puppeteer';

// TODO: Refactor when implementing into coveo/cli
// Copy from https://github.com/coveo/cli/blob/07b6c64ac76e6e508a44ad932dd9569d66561c9f/packages/cli-e2e/utils/platform.ts#L20-L21
export function isSearchRequestOrResponse(
  requestOrResponse: HTTPRequest | HTTPResponse
) {
  return (
    requestOrResponse.url().indexOf('/rest/search/v2?organizationId') !== -1
  );
}
