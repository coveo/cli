import {Command, flags} from '@oclif/command';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {
  Preconditions,
  IsAuthenticated,
} from '../../../lib/decorators/preconditions';
import {Config} from '../../../lib/config/config';
import PlatformClient from '@coveord/platform-client';
import {writeFile} from 'fs-extra';
import {Parser} from 'json2csv';
import {cli} from 'cli-ux';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
// eslint-disable-next-line node/no-extraneous-import
import {SingleBar} from 'cli-progress';

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
  static description =
    'Dump the whole content of a particular source in a CSV format.';

  static flags = {
    source: flags.string({
      char: 's',
      description:
        'The name (not the identifier) of the source(s) for which to extract all documents.',
      helpValue: 'mySourceName',
      required: true,
      multiple: true,
    }),
    pipeline: flags.string({
      char: 'p',
      description:
        'The name of the query pipeline for which to extract all documents. If not specified, the default query pipeline will be used.',
    }),
    fieldsToExclude: flags.string({
      char: 'x',
      description:
        'The fields to exclude from the datadump. If not specified, all fields will be returned',
      multiple: true,
    }),
    destination: flags.string({
      char: 'd',
      description:
        'The folder destination where the CSV file should be created',
      default: '.',
    }),
    name: flags.string({
      char: 'n',
      description: 'The name of the CSV file that should be created',
      default: 'indexdump',
    }),
    additionalFilter: flags.string({
      char: 'f',
      description:
        'Additional search filter that should be applied while doing the extraction. See https://docs.coveo.com/en/1552 for more information',
      default: '',
    }),
    chunkSize: flags.integer({
      char: 'c',
      description:
        'The maximum number of results extract into each CSV file. Default is 10000',
      default: 10000,
    }),
  };

  @Preconditions(IsAuthenticated())
  async run() {
    const {flags} = this.parse(Dump);
    const client = await new AuthenticatedClient().getClient();
    const organizationId = (
      await new Config(this.config.configDir, this.error).get()
    ).organization;

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
        'Found no results. Are you sure the sources name, filters, pipeline are valid ?'
      );
    } else {
      await this.writeChunks(allResults);
    }

    this.config.runHook('analytics', buildAnalyticsSuccessHook(this, flags));
  }

  async catch(err?: Error) {
    const {flags} = this.parse(Dump);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private async writeChunks(allResults: SearchResult[]) {
    const {flags} = this.parse(Dump);
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
    return cli.progress({
      format: 'Progress | {bar} | ETA: {eta}s | {value}/{total} results',
    }) as SingleBar;
  }
}
