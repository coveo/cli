import {Command, Flags, CliUx} from '@oclif/core';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {
  Preconditions,
  IsAuthenticated,
} from '../../../lib/decorators/preconditions';
import {Config} from '../../../lib/config/config';
import PlatformClient from '@coveord/platform-client';
import {writeFile} from 'fs-extra';
import {Parser} from 'json2csv';
// eslint-disable-next-line node/no-extraneous-import
import {SingleBar} from 'cli-progress';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';

interface SearchResult {
  raw: {rowid: string};
}
interface SearchResponse {
  indexToken: string;
  results: SearchResult[];
  totalCount: number;
}

interface FetchParameters {
  client: PlatformClient;
  organizationId: string;
  sources: string[];
  additionalFilter: string;
  fieldsToExclude: string[] | undefined;
  pipeline: string | undefined;
}

export default class Dump extends Command {
  public static description =
    'Dump the content of one or more sources in CSV format.';

  public static flags = {
    source: Flags.string({
      char: 's',
      description:
        'The names (not the identifiers) of the sources from which to get content.',
      helpValue: 'mySourceName',
      required: true,
      multiple: true,
    }),
    pipeline: Flags.string({
      char: 'p',
      description:
        'The name of the query pipeline through which to get content. If not specified, the default query pipeline is used.',
    }),
    fieldsToExclude: Flags.string({
      char: 'x',
      description:
        'The fields to exclude from the data dump. If not specified, all fields are included.',
      multiple: true,
    }),
    destination: Flags.string({
      char: 'd',
      description:
        "The folder in which to create the CSV files. The data dump will fail if the folder doesn't exist.",
      default: '.',
    }),
    name: Flags.string({
      char: 'n',
      description:
        'The base name to use when creating a new CSV file. If more than one file is created, the CLI will append `_2`, `_3`, etc. to each new file name after the first one.',
      default: 'indexdump',
    }),
    additionalFilter: Flags.string({
      char: 'f',
      description:
        'The additional search filter to apply while getting the content. See <https://docs.coveo.com/en/1552>.',
      default: '',
    }),
    chunkSize: Flags.integer({
      char: 'c',
      description: 'The maximum number of results to dump into each CSV file.',
      default: 10000,
    }),
  };

  @Trackable({eventName: 'source content dump'})
  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = await this.parse(Dump);
    const client = await new AuthenticatedClient().getClient();
    const organizationId = (await new Config(this.config.configDir).get())
      .organization;

    const allResults = await this.fetchResults({
      client,
      organizationId,
      sources: flags.source,
      pipeline: flags.pipeline,
      additionalFilter: flags.additionalFilter,
      fieldsToExclude: flags.fieldsToExclude,
    });

    if (allResults.length === 0) {
      this.log(
        'No results found. Ensure that the specified sources, query pipeline, and additional filter are valid.'
      );
    } else {
      await this.writeChunks(allResults);
    }
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async writeChunks(allResults: SearchResult[]) {
    const {flags} = await this.parse(Dump);
    let currentChunk = 0;
    while (allResults.length) {
      const chunk = allResults.splice(0, flags.chunkSize);
      const data = chunk.map((r) => r.raw);
      const parser = new Parser({fields: Object.keys(chunk[0].raw)});
      await writeFile(
        `${flags.destination}/${flags.name}${
          currentChunk > 0 ? `_${currentChunk + 1}` : ''
        }.csv`,
        parser.parse(data)
      );
      currentChunk++;
    }
  }

  private getFilter(params: FetchParameters, rowId = '') {
    const sourcesFilter = `(${params.sources
      .map((source) => `( @source=="${source}" )`)
      .join(' OR ')})`;

    return `${sourcesFilter} ${params.additionalFilter} ${
      rowId !== '' ? `( @rowid>${rowId} )` : ''
    }`;
  }

  private async fetchResults(
    params: FetchParameters,
    progress = this.progressBar,
    indexToken = '',
    rowId = ''
  ): Promise<SearchResult[]> {
    const isFirstQuery = indexToken === '';

    if (isFirstQuery) {
      this.log(
        `Fetching all results from organization ${
          params.organizationId
        } from source(s) ${params.sources.join(',')}...`
      );
      if (params.additionalFilter) {
        this.log(`Applying additional filter ${params.additionalFilter}`);
      }
      progress.start(1000, 0);
    }

    const response = (await params.client.search.query({
      aq: this.getFilter(params, rowId),
      debug: true,
      organizationId: params.organizationId,
      numberOfResults: 1000,
      sortCriteria: '@rowid ascending',
      ...(params.fieldsToExclude && {fieldsToExclude: params.fieldsToExclude}),
      ...(params.pipeline && {pipeline: params.pipeline}),
      ...(indexToken !== '' && {indexToken: indexToken}),
    })) as SearchResponse;
    if (isFirstQuery) {
      progress.setTotal(response.totalCount);
    }

    progress.increment(response.results.length);

    const lastRetrievedIndexToken = response.indexToken;
    if (response.results.length === 1000) {
      const lastRowID = response.results[999].raw.rowid;
      const nextPage = await this.fetchResults(
        params,
        progress,
        lastRetrievedIndexToken,
        lastRowID
      );
      return response.results.concat(nextPage);
    }
    progress.stop();
    return response.results;
  }

  private get progressBar() {
    return CliUx.ux.progress({
      format: 'Progress | {bar} | ETA: {eta}s | {value}/{total} results',
    }) as SingleBar;
  }
}
