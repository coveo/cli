import fetch from 'node-fetch';
import {PageManifest} from './page-manifest';

export async function fetchPageManifest(
  platformUrl: string,
  orgId: string,
  pageId: string,
  apiKey: string
) {
  const url = `${platformUrl}/rest/organizations/${orgId}/searchinterfaces/${pageId}/manifest/v1`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return replaceResultsPlaceholder((await response.json()) as PageManifest);
}

function replaceResultsPlaceholder(pageManifest: PageManifest): PageManifest {
  const resultManagerComponent = '<results-manager></results-manager>';
  pageManifest.markup = pageManifest.markup.replace(
    pageManifest.results.placeholder,
    resultManagerComponent
  );

  return pageManifest;
}
