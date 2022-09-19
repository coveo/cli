import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags, CliUx} from '@oclif/core';
import {readJSONSync, writeFileSync, writeJSONSync} from 'fs-extra';
import {Parser} from 'json2csv';
import {SingleBar} from 'cli-progress';
import PlatformClient from '@coveord/platform-client';
import {dirSync} from 'tmp';

import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  Preconditions,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions/index';
import {Config} from '@coveo/cli-commons/config/config';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {without} from '../../../lib/utils/list';
import {join} from 'path';
import dedent from 'ts-dedent';
type ResponseExceededMaximumSizeError = {message: string; type: string};

interface RawResult {
  rowid: string;
  [key: string]: unknown;
}
interface SearchResult {
  raw: RawResult;
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

export default class Dump extends CLICommand {
  private static readonly DefaultNumberOfResultPerQuery = 1000;
  private static mandatoryFields = ['rowid', 'sysrowid'];

  public static description = dedent`
      Dump the content of one or more sources in CSV format.
    
      Note: DictionnaryFields/Values are experimentally supported. In case of failure, you should exclude them using the \`-x\` flag.
    `;

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

  private aggregatedResults: RawResult[] = [];
  private aggregatedFieldsWithDupes: string[] = [];
  private temporaryDumpDirectory = dirSync();
  private numberOfResultPerQuery = Dump.DefaultNumberOfResultPerQuery;
  private internalDumpFileIdx = 0;
  private progressBar?: SingleBar;

  private static readonly ResponseExceededMaximumSizeType =
    'ResponseExceededMaximumSizeException';

  private get dumpFileIndex() {
    return this.internalDumpFileIdx++;
  }

  @Trackable({eventName: 'source content dump'})
  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = await this.parse(Dump);
    const client = await new AuthenticatedClient().getClient();
    const organizationId = new Config(this.config.configDir).get().organization;
    const fieldsToExclude =
      flags.fieldsToExclude &&
      without(flags.fieldsToExclude, Dump.mandatoryFields);
    const hasResults = await this.fetchResults({
      client,
      organizationId,
      sources: flags.source,
      pipeline: flags.pipeline,
      additionalFilter: flags.additionalFilter,
      fieldsToExclude,
    });

    if (hasResults) {
      await this.convertRawChunksToCSVs();
    } else {
      this.log(
        'No results found. Ensure that the specified sources, query pipeline, and additional filter are valid.'
      );
    }
  }

  public catch(err?: Error & {exitCode?: number}) {
    this.progressBar?.stop();
    return super.catch(err);
  }

  private async convertRawChunksToCSVs() {
    const {flags} = await this.parse(Dump);
    const fields = this.getFieldsToExport(flags.fieldsToExclude!);
    for (
      let currentDumpFileIndex = this.internalDumpFileIdx - 1;
      currentDumpFileIndex >= 0;
      currentDumpFileIndex--
    ) {
      const data = readJSONSync(
        this.getDumpFilePathFromIndex(currentDumpFileIndex)
      );
      const parser = new Parser({fields});
      writeFileSync(
        join(
          flags.destination,
          `${flags.name}${
            this.internalDumpFileIdx === 1 ? '' : currentDumpFileIndex
          }.csv`
        ),
        parser.parse(data)
      );
    }
  }

  private getFieldsToExport(fieldsToExclude: string[]) {
    const fieldSet = new Set(this.aggregatedFieldsWithDupes);
    for (const fieldToExclude of fieldsToExclude ?? []) {
      fieldSet.delete(fieldToExclude);
    }
    return Array.from(fieldSet);
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
    indexToken = '',
    rowId = ''
  ): Promise<boolean> {
    this.progressBar = this.getProgressBar();
    this.log(
      `Fetching all results from organization ${
        params.organizationId
      } from source(s) ${params.sources.join(',')}...`
    );
    if (params.additionalFilter) {
      this.log(`Applying additional filter ${params.additionalFilter}`);
    }
    this.progressBar.start(Dump.DefaultNumberOfResultPerQuery, 0);
    let lastResultsLength;

    do {
      const isFirstQuery = indexToken === '';

      const response = await this.doQuery(params, rowId, indexToken);
      if (isFirstQuery) {
        this.progressBar.setTotal(response.totalCount);
      }

      this.progressBar.increment(response.results.length);

      lastResultsLength = response.results.length;
      await this.aggregateResults(response.results.map((result) => result.raw));
      if (lastResultsLength < this.numberOfResultPerQuery) {
        break;
      }
      indexToken = response.indexToken;
      rowId = response.results[lastResultsLength - 1].raw.rowid;
    } while (lastResultsLength >= this.numberOfResultPerQuery);
    this.progressBar.stop();
    return this.progressBar.getTotal() > 0;
  }

  private async doQuery(
    params: FetchParameters,
    rowId?: string,
    indexToken?: string
  ): Promise<SearchResponse> {
    while (this.numberOfResultPerQuery !== 0) {
      try {
        const results = (await params.client.search.query({
          aq: this.getFilter(params, rowId),
          debug: true,
          organizationId: params.organizationId,
          numberOfResults: this.numberOfResultPerQuery,
          sortCriteria: '@rowid ascending',
          ...(params.fieldsToExclude && {
            fieldsToExclude: params.fieldsToExclude,
          }),
          ...(params.pipeline && {pipeline: params.pipeline}),
          ...(indexToken !== '' && {indexToken: indexToken}),
        })) as SearchResponse;
        return results;
      } catch (error) {
        if (this.isResponseExceededMaximumSizeError(error)) {
          this.numberOfResultPerQuery = Math.floor(
            this.numberOfResultPerQuery / 2
          );
        } else {
          throw error;
        }
      }
    }
    this.error(
      dedent`
      Response exceeds the maximum size of 31457280 bytes.
      Cannot query a single result, please exclude some/more fields
      `
    );
  }

  private isResponseExceededMaximumSizeError(
    error: unknown
  ): error is ResponseExceededMaximumSizeError {
    return (
      (error as ResponseExceededMaximumSizeError)?.type ===
      Dump.ResponseExceededMaximumSizeType
    );
  }

  private getProgressBar() {
    return CliUx.ux.progress({
      format: 'Progress | {bar} | ETA: {eta}s | {value}/{total} results',
    }) as SingleBar;
  }

  private async aggregateResults(results: RawResult[]) {
    const maxAggregatedResults = (await this.parse(Dump)).flags.chunkSize;
    while (results.length > 0) {
      const amountOfNewResultsToExtract =
        maxAggregatedResults - this.aggregatedResults.length;
      this.aggregatedResults.push(
        ...results.splice(
          0,
          Math.min(amountOfNewResultsToExtract, results.length)
        )
      );
      this.dumpAggregatedResults();
    }
  }

  private getDumpFilePathFromIndex(index: number) {
    return join(this.temporaryDumpDirectory.name, `dump${index}`);
  }

  private dumpAggregatedResults() {
    this.extractFieldsFromAggregatedResults();
    writeJSONSync(
      this.getDumpFilePathFromIndex(this.dumpFileIndex),
      this.aggregatedResults
    );
    this.aggregatedResults = [];
  }

  private extractFieldsFromAggregatedResults() {
    this.aggregatedFieldsWithDupes.push(
      ...this.aggregatedResults.flatMap(Object.keys)
    );
  }
}
