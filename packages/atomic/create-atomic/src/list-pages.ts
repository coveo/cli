import {PlatformClient} from '@coveord/platform-client';

export async function listSearchPagesOptions(client: PlatformClient) {
  return (await client.searchInterfaces.list({})).items.map((page) => ({
    value: page.id,
    name: page.name,
  }));
}
