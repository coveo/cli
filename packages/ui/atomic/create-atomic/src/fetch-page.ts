import {
  PlatformClient,
  IManifestResponse,
  ISearchInterfaceConfigurationResponse,
} from '@coveo/platform-client';

/**
 * @coveo/platform-client's IManifestResponse with simplified configuration
 */
export interface IManifest extends Omit<IManifestResponse, 'config'> {
  config: Pick<ISearchInterfaceConfigurationResponse, 'name'>;
}

export async function fetchPageManifest(
  client: PlatformClient,
  pageId: string,
  type: 'next-gen' | 'legacy' | 'unknown',
  apiKey: string,
  orgId: string,
  platformUrl: string
) {
  let manifestGetters = [];
  // if (type !== 'next-gen') {
  //   manifestGetters.push(getLegacyManifest);
  // }
  if (type !== 'legacy') {
    manifestGetters.push(getNextGenManifest);
  }
  for (const manifestGetter of manifestGetters) {
    let manifest: IManifest;
    try {
      manifest = await manifestGetter(
        client,
        pageId,
        apiKey,
        orgId,
        platformUrl
      );
    } catch (error) {
      continue;
    }
    return replaceResultsPlaceholder(manifest);
  }
  throw 'PANIC';
}

function replaceResultsPlaceholder(manifestResponse: IManifest) {
  const resultManagerComponent = '<results-manager></results-manager>';
  if (manifestResponse.results.placeholder) {
    manifestResponse.markup = manifestResponse.markup.replace(
      manifestResponse.results.placeholder,
      resultManagerComponent
    );
  }

  return manifestResponse;
}

async function getLegacyManifest(
  client: PlatformClient,
  pageId: string
): Promise<IManifest> {
  return await client.searchInterfaces.manifest(pageId, {
    pagePlaceholders: {
      results: '--results--',
    },
  });
}

async function getNextGenManifest(
  client: PlatformClient,
  pageId: string,
  apiKey: string,
  orgId: string,
  platformUrl: string
): Promise<IManifest> {
  return (
    await fetch(
      `http://localhost:8222/rest/organizations/${orgId}/searchpage/v1/interfaces/${pageId}/manifest`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: {
          //@ts-ignore shush, it works.
          pagePlaceholders: {
            results: '--results--',
          },
        },
        method: 'POST',
      }
    )
  ).json() as Promise<IManifest>;
}
