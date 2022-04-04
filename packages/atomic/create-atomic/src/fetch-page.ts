import 'isomorphic-fetch';
import 'abortcontroller-polyfill';
import HttpsProxyAgent from 'https-proxy-agent';
import {PlatformClient, IManifestResponse} from '@coveord/platform-client';

export async function fetchPageManifest(
  host: string,
  organizationId: string,
  pageId: string,
  accessToken: string
) {
  const globalRequestSettings: Record<string, unknown> = {};
  const proxyServer = process.env['https_proxy'] || process.env['HTTPS_PROXY'];
  if (proxyServer) {
    const httpsProxyAgent = HttpsProxyAgent(proxyServer);
    globalRequestSettings.agent = httpsProxyAgent;
  }

  const client = new PlatformClient({
    globalRequestSettings,
    organizationId,
    accessToken,
    host,
  });

  const manifest = await client.searchInterfaces.manifest(pageId, {
    pagePlaceholders: {
      results: '--results--',
    },
  });
  return replaceResultsPlaceholder(manifest);
}

function replaceResultsPlaceholder(manifestResponse: IManifestResponse) {
  const resultManagerComponent = '<results-manager></results-manager>';
  if (manifestResponse.results.placeholder) {
    manifestResponse.markup = manifestResponse.markup.replace(
      manifestResponse.results.placeholder,
      resultManagerComponent
    );
  }

  return manifestResponse;
}
