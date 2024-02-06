import {
  PlatformClient,
  IManifestResponse,
  ISearchInterfaceConfigurationResponse,
} from '@coveo/platform-client';
import {createWriteStream, readFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {resolve} from 'node:path';

/**
 * @coveo/platform-client's IManifestResponse with simplified configuration
 */
export interface IManifest extends Omit<IManifestResponse<never>, 'config'> {
  config: Pick<ISearchInterfaceConfigurationResponse, 'name'>;
}

export async function fetchPageManifest(
  client: PlatformClient,
  pageId: string,
  type: 'next-gen' | 'legacy' | 'unknown'
) {
  let manifestGetters = [];
  await getAndLogNgsp(pageId);
  if (type !== 'legacy') {
    manifestGetters.push(getNextGenManifest);
  }
  if (type !== 'next-gen') {
    manifestGetters.push(getLegacyManifest);
  }
  for (const manifestGetter of manifestGetters) {
    let manifest: IManifest;
    try {
      manifest = await manifestGetter(client, pageId);
    } catch (error) {
      continue;
    }
    return replaceResultsPlaceholder(manifest);
  }
  throw new Error('Could not fetch the page manifest');
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
  pageId: string
): Promise<IManifest> {
  return await client.nextGenSearchPages.manifest(pageId, {
    pagePlaceholders: {
      results: '--results--',
    },
  });
}

async function getAndLogNgsp(pageId: string) {
  const {accessToken, organizationId} = getConfig();
  const request = await fetch(
    `https://platformstg.cloud.coveo.com/rest/organizations/${organizationId}/searchpage/v1/interfaces/${pageId}/manifest`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'POST',
    }
  );
  const logfilepath = resolve(
    process.env.GITHUB_WORKSPACE!,
    'packages/cli-e2e/artifacts',
    `ngsp${pageId}.log`
  );
  const log = createWriteStream(logfilepath, {flags: 'a'});
  log.write('---- Start of NGSP request ----');
  log.write(`ok: ${request.ok}`);
  log.write(`status: ${request.status}`);
  log.write(`statusText: ${request.statusText}`);
  log.write(`url: ${request.url}`);
  log.write(`body: ${await request.text()}`);
  log.write(`headers: ${JSON.stringify(request.headers.get('X-Request-ID'))}`);
  log.write('---- End of NGSP request ----');
  log.end();
}
export function getConfigFilePath() {
  const configsDir = process.platform === 'win32' ? 'AppData/Local' : '.config';
  return resolve(homedir(), configsDir, '@coveo', 'cli', 'config.json');
}

export function getConfig() {
  const pathToConfig = getConfigFilePath();

  return JSON.parse(readFileSync(pathToConfig, {encoding: 'utf-8'}));
}
