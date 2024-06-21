import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags, CliUx} from '@oclif/core';
import PlatformClient from '@coveo/platform-client';

import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {
  Preconditions,
  IsAuthenticated,
} from '@coveo/cli-commons/preconditions/index';
import {Config} from '@coveo/cli-commons/config/config';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import dedent from 'ts-dedent';
import {formatOrgId} from '@coveo/cli-commons/utils/ux';

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
}

export default class Search extends CLICommand {
  public static description = dedent`
      Perform a search
    `;

  public static flags = {
    userId: Flags.string({
      char: 'u',
      description:
        'The user ID to use for the search. If not specified, the search is performed as the current user.',
      helpValue: 'asmith@barca.com',
      required: true,
      multiple: true,
    }),
  };

  @Trackable({eventName: 'create search token'})
  @Preconditions(IsAuthenticated())
  public async run() {
    const client = await new AuthenticatedClient();
    const organizationId = new Config(this.config.configDir).get().organization;

    const searchToken = await client.createSearchToken([Search.flags.userId]);

    const hasResults = await this.fetchResults({
      client,
      organizationId,
    });
  }

  public catch(err?: Error & {exitCode?: number}) {
    return super.catch(err);
  }

  private async fetchResults(params: FetchParameters): Promise<SearchResponse> {
    this.log(
      `Fetching all results from organization ${formatOrgId(
        params.organizationId
      )}`
    );
    const response = await this.doQuery(params);
    return response;
  }

  private async doQuery(params: FetchParameters): Promise<SearchResponse> {
    try {
      const results = (await params.client.search.query({
        debug: true,
        organizationId: params.organizationId,
      })) as unknown as SearchResponse;
      return results;
    } catch (error) {
      // handle the error here
      throw error;
    }
  }
}
