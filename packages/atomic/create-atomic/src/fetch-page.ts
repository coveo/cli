import fetch from 'node-fetch';
import {
  PageManifest,
  PageManifestBody,
  ResultsPlaceholder,
} from './page-manifest.js';

export async function fetchPageManifest(
  platformUrl: string,
  orgId: string,
  pageId: string,
  apiKey: string
) {
  const url = `${platformUrl}/rest/organizations/${orgId}/searchinterfaces/${pageId}/manifest/v1`;
  const body: PageManifestBody = {
    pagePlaceholders: {
      results: ResultsPlaceholder,
    },
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  return replaceResultsPlaceholder((await response.json()) as PageManifest);
}

function replaceResultsPlaceholder(pageManifest: PageManifest): PageManifest {
  const resultManagerComponent = '<results-manager></results-manager>';
  pageManifest.markup = pageManifest.markup.replace(
    pageManifest.results.placeholder!,
    resultManagerComponent
  );

  return pageManifest;
}
