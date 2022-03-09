import fetch from 'node-fetch';

export interface PageManifestConfig {
  title: string;
}

export interface PageManifestHtmlResultTemplate {
  attributes: string;
  content: string;
}

export interface PageManifestHtml {
  searchInterface: string;
  style: string;
  resultListAttributes: string;
  resultTemplates: PageManifestHtmlResultTemplate[];
}

export interface PageManifest {
  html: PageManifestHtml;
  config: PageManifestConfig;
}

export async function fetchPageManifest(
  platformUrl: string,
  orgId: string,
  pageId: string,
  apiKey: string
) {
  const url = `${platformUrl}/rest/organizations/${orgId}/searchinterfaces/${pageId}/download`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
  return customizePageManifest((await response.json()) as PageManifest);
}

function customizePageManifest(pageManifest: PageManifest): PageManifest {
  const resultListPlaceholder = '<!--result-list-->';
  const resultManagerComponent = '<results-manager></results-manager>';
  pageManifest.html.searchInterface = pageManifest.html.searchInterface.replace(
    resultListPlaceholder,
    resultManagerComponent
  );

  return pageManifest;
}
