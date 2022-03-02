import fetch from 'node-fetch';

export interface PageDownloadConfig {
  title: string;
}

export interface PageDownloadHtmlResultTemplate {
  attributes: string;
  content: string;
}

export interface PageDownloadHtml {
  searchInterface: string;
  style: string;
  resultListAttributes: string;
  resultTemplates: PageDownloadHtmlResultTemplate[];
}

export interface PageDownload {
  html: PageDownloadHtml;
  config: PageDownloadConfig;
}

export async function fetchPageDownload(
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
  return (await response.json()) as PageDownload;
}
