import {Command, flags} from '@oclif/command';
import {Source} from '@coveo/push-api-client';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import dedent from 'ts-dedent';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {green, red} from 'chalk';
import type {AxiosResponse} from 'axios';

interface ErrorFromAPI {
  response: {
    status: number;
    data: {
      errorCode: string;
      message: string;
    };
  };
}

export default class SourcePushDelete extends Command {
  public static description =
    'Delete one or multiple documents in a given push source. See https://docs.coveo.com/en/171 and https://docs.coveo.com/en/131';

  public static flags = {
    deleteOlderThan: flags.string({
      char: 'd',
      exclusive: ['delete'],
      description:
        'Delete old items, using either an ISO 8601 date or a Unix timestamp',
      helpValue: '2000-01-01T00:00:00-06:00 [ OR ] 946702800',
    }),
    delete: flags.string({
      char: 'x',
      multiple: true,
      description:
        'Document URI or identfier to delete. Can be repeated. If you want to delete a large batch of documents, use source:push:batch command instead.',
    }),
    deleteChildren: flags.boolean({
      char: 'c',
      default: true,
      description:
        'Specify if children document should also be deleted. Default to `true`.',
    }),
  };

  public static args = [
    {
      name: 'sourceId',
      required: true,
      description:
        'The identifier of the source on which to perform the delete operation. See source:push:list to obtain the identifier.',
    },
  ];

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(SourcePushDelete);
    if (!flags.deleteOlderThan && !flags.delete) {
      this.error(
        'You must provide either --delete= or --deleteOlderThan=. See source:push:delete --help for more information.'
      );
    }
    const cfg = await new AuthenticatedClient().cfg.get();
    const source = new Source(cfg.accessToken!, cfg.organization);

    if (flags.deleteOlderThan) {
      this.doDeletionOlderThan(source);
      return;
    }

    if (flags.delete) {
      if (this.isNumberOfDeletionTooLarge()) {
        return;
      }

      await this.doDeletionDocumentURI(source);
    }
    await this.config.runHook('analytics', buildAnalyticsSuccessHook(this, {}));
  }

  private isNumberOfDeletionTooLarge() {
    if (this.flags.delete.length > 20) {
      this.warn(
        dedent(
          'To delete large batch of documents, use source:push:batch command instead.'
        )
      );
      return true;
    }

    return false;
  }

  private async doDeletionOlderThan(source: Source) {
    const {flags, args} = this.parse(SourcePushDelete);
    const toDelete = `older than ${flags.deleteOlderThan}`;
    try {
      const res = await source.deleteDocumentsOlderThan(
        args.sourceId,
        flags.deleteOlderThan!
      );
      this.successMessageOnDeletion(toDelete, res);
    } catch (e) {
      this.errorMessageOnDeletion(toDelete, e);
    }
  }

  private doDeletionDocumentURI(source: Source) {
    const {flags, args} = this.parse(SourcePushDelete);
    return Promise.all(
      flags.delete.map(async (toDelete) => {
        try {
          const res = await source.deleteDocument(
            args.sourceId,
            toDelete,
            flags.deleteChildren
          );
          this.successMessageOnDeletion(toDelete, res);
        } catch (e) {
          this.errorMessageOnDeletion(toDelete, e);
        }
      })
    );
  }

  private get flags() {
    return this.parse(SourcePushDelete).flags;
  }

  private errorMessageOnDeletion(toDelete: string, e: ErrorFromAPI) {
    this.warn(
      dedent(`
  Error while trying to delete document: ${red(toDelete)}.
  Status code: ${red(e.response.status)}
  Error code: ${red(e.response.data.errorCode)}
  Message: ${red(e.response.data.message)}
  `)
    );
  }

  private successMessageOnDeletion(toDelete: string, res: AxiosResponse) {
    this.log(
      dedent(`
    Successfully deleted document: ${green(toDelete)}
    Status code: ${green(res.status, res.statusText)}
    `)
    );
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(SourcePushDelete);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }
}
