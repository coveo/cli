import {Command, Flags, CliUx} from '@oclif/core';
import {readJSONSync, writeFile, writeJSONSync} from 'fs-extra';
import {Parser} from 'json2csv';
import {SingleBar} from 'cli-progress';
import PlatformClient from '@coveord/platform-client';
import {dirSync} from 'tmp';

import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {
  Preconditions,
  IsAuthenticated,
} from '../../../lib/decorators/preconditions';
import {Config} from '../../../lib/config/config';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {without} from '../../../lib/utils/list';
import {join} from 'path';

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

export default class Dump extends Command {
  private static readonly numberOfResultPerQuery = 1000;
  private static mandatoryFields = ['rowid', 'sysrowid'];

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

  private aggregatedResults: RawResult[] = [];
  private aggregatedFieldsWithDupes: string[] = [];
  private temporaryDumpDirectory = dirSync();
  private internalDumpFileIdx = 0;

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

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async convertRawChunksToCSVs() {
    const {flags} = await this.parse(Dump);
    const fields = this.getFieldsToExport(flags);
    for (
      let currentDumpFileIndex = this.internalDumpFileIdx - 1;
      currentDumpFileIndex >= 0;
      currentDumpFileIndex--
    ) {
      const data = readJSONSync(
        this.getDumpFilePathFromIndex(currentDumpFileIndex)
      );
      const parser = new Parser({fields});
      await writeFile(
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

  private getFieldsToExport({fieldsToExclude}: {fieldsToExclude: string[]}) {
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
    const progress = this.progressBar;
    this.log(
      `Fetching all results from organization ${
        params.organizationId
      } from source(s) ${params.sources.join(',')}...`
    );
    if (params.additionalFilter) {
      this.log(`Applying additional filter ${params.additionalFilter}`);
    }
    progress.start(Dump.numberOfResultPerQuery, 0);
    let lastResultsLength;

    do {
      const isFirstQuery = indexToken === '';

      const response = (await params.client.search.query({
        aq: this.getFilter(params, rowId),
        debug: true,
        organizationId: params.organizationId,
        numberOfResults: Dump.numberOfResultPerQuery,
        sortCriteria: '@rowid ascending',
        ...(params.fieldsToExclude && {
          fieldsToExclude: params.fieldsToExclude,
        }),
        ...(params.pipeline && {pipeline: params.pipeline}),
        ...(indexToken !== '' && {indexToken: indexToken}),
      })) as SearchResponse;
      if (isFirstQuery) {
        progress.setTotal(response.totalCount);
      }

      progress.increment(response.results.length);

      lastResultsLength = response.results.length;
      await this.aggregateResults(response.results.map((result) => result.raw));
      if (lastResultsLength < Dump.numberOfResultPerQuery) {
        break;
      }
      indexToken = response.indexToken;
      rowId = response.results[lastResultsLength - 1].raw.rowid;
    } while (true);
    if (this.aggregatedResults.length > 0) {
      this.dumpAggregatedResults();
    }
    progress.stop();
    return progress.getTotal() > 0;
  }

  private get progressBar() {
    return CliUx.ux.progress({
      format: 'Progress | {bar} | ETA: {eta}s | {value}/{total} results',
    }) as SingleBar;
  }

  private async aggregateResults(newResults: RawResult[]) {
    const maxAggregatedResults = (await this.parse(Dump)).flags.chunkSize;
    const amountOfNewResultsToExtract =
      maxAggregatedResults - this.aggregatedResults.length;
    this.aggregatedResults.push(
      ...newResults.splice(
        0,
        Math.min(amountOfNewResultsToExtract, newResults.length)
      )
    );
    if (newResults.length > 0) {
      this.dumpAggregatedResults();
      await this.aggregateResults(newResults);
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
