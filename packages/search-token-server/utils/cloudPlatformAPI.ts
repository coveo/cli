import fetch, {Response} from 'node-fetch';

export function getSearchToken(options: {
  userIds: {name: string; provider: string}[];
  hostname: string;
  apiKey: string;
  searchHub?: string;
}) {
  const body: {[id: string]: any} = {
    userIds: options.userIds,
  };
  if (options.searchHub) {
    body.searchHub = options.searchHub;
  }

  return fetch(`${options.hostname}/rest/search/token`, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
  }).then((res: Response) => res.json());
}
