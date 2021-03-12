import {HTTPRequest} from 'puppeteer';

export function isSearchRequest(request: HTTPRequest) {
  return request.url().startsWith(
    // TODO: CDX-98: URL should vary in fonction of the targeted environment.
    'https://platformdev.cloud.coveo.com/rest/search/v2?organizationId'
  );
}
