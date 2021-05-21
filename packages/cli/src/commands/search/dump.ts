import {Command, flags} from '@oclif/command';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {
  Preconditions,
  IsAuthenticated,
} from '../../lib/decorators/preconditions/';
import {Config} from '../../lib/config/config';
import PlatformClient from '@coveord/platform-client';
import {writeFile} from 'fs-extra';
import {Parser} from 'json2csv';
import {cli} from 'cli-ux';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../hooks/analytics/analytics';

interface SearchResult {
  raw: {rowid: string};
}

interface ProgressBar {
  update: (up: number) => void;
  stop: () => void;
  start: (total: number, current: number) => void;
  setTotal: (tot: number) => void;
  increment: (inc: number) => void;
}

interface SearchResponse {
  indexToken: string;
  results: SearchResult[];
  totalCount: number;
}

interface FetchParameters {
  client: PlatformClient;
  organizationId: string;
  source: string;
  additionalFilter: string;
}

export default class Dump extends Command {
  static description =
    'Dump the whole content of a particular source in a CSV format.';

  static flags = {
    source: flags.string({
      char: 's',
      description:
        'The identifier of the source for which to extract all documents.',
      helpValue: 'mySourceName',
      required: true,
    }),
    destination: flags.string({
      char: 'd',
      description:
        'The folder destination where the CSV file should be created',
      default: '.',
    }),
    name: flags.string({
      char: 'd',
      description: 'The name of the CSV file that should be created',
      default: 'indexdump',
    }),
    additionalFilter: flags.string({
      char: 'f',
      description:
        'Additional search filter that should be applied while doing the extraction. See https://docs.coveo.com/en/1552 for more information',
      default: '',
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
      source: flags.source,
      additionalFilter: flags.additionalFilter,
    });

    if (allResults.length === 0) {
      this.log(
        'Found no results. Are you sure the source name and filter are valid ?'
      );
    } else {
      const data = allResults.map((r) => r.raw);
      const parser = new Parser({fields: Object.keys(allResults[0].raw)});
      writeFile(`${flags.destination}/${flags.name}.csv`, parser.parse(data));
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

  private getFilter(params: FetchParameters, rowId = '') {
    return `( @source=="${params.source}" ) ${params.additionalFilter} ${
      rowId !== '' ? `( @rowid>${rowId} )` : ''
    }`;
  }

  private async fetchResults(
    params: FetchParameters,
    progress: ProgressBar = this.progressBar,
    indexToken = '',
    rowId = ''
  ): Promise<SearchResult[]> {
    const isFirstQuery = indexToken === '';

    if (isFirstQuery) {
      this.log(
        `Fetching all results from organization ${params.organizationId} from source ${params.source}...`
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
    } else {
      progress.stop();
      return response.results;
    }
  }

  private get progressBar() {
    return cli.progress({
      format: 'Progress | {bar} | ETA: {eta}s | {value}/{total} results',
    }) as ProgressBar;
  }
}
