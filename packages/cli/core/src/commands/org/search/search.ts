import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Flags, CliUx} from '@oclif/core';
import PlatformClient, {TokenModel} from '@coveo/platform-client';

import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {RestUserId} from '@coveo/platform-client';

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
    userIds: Flags.string({
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

    const {flags} = await this.parse(Search);
    console.log(flags);
    console.log(flags.userId);
    const userIds: RestUserId[] = flags.userIds.map((userId: String) => {
      return {
        name: userId,
        provider: 'Email Security Provider',
        type: 'User',
      } as RestUserId;
    });

    const searchToken: TokenModel = await client.createSearchToken(userIds);

    const searchResults = await client.searchWithToken(searchToken, 'test');
    console.log(searchResults);
  }

  public catch(err?: Error & {exitCode?: number}) {
    return super.catch(err);
  }
}
