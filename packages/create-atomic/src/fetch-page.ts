import fetch from 'node-fetch';

export interface PageDownload {
  html: string;
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
