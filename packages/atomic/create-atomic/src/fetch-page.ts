import {
  PlatformClient,
  IManifestResponse,
  ISearchInterfaceConfigurationResponse,
} from '@coveord/platform-client';

/**
 * @coveord/platform-client's IManifestResponse with simplified configuration
 */
export interface IManifest extends Omit<IManifestResponse, 'config'> {
  config: Pick<ISearchInterfaceConfigurationResponse, 'title'>;
}

export async function fetchPageManifest(
  client: PlatformClient,
  pageId: string
) {
  const manifest = await client.searchInterfaces.manifest(pageId, {
    pagePlaceholders: {
      results: '--results--',
    },
  });
  return replaceResultsPlaceholder(manifest);
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
