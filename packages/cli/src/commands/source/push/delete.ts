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
import {
  AxiosResponse,
  ErrorFromAPI,
  errorMessage,
  successMessage,
} from '../../../lib/push/userFeedback';

export default class SourcePushDelete extends Command {
  public static description =
    'Delete one or multiple items in a given Push source. See <https://docs.coveo.com/en/171> and <https://docs.coveo.com/en/131>';

  public static flags = {
    deleteOlderThan: flags.string({
      char: 'd',
      exclusive: ['delete'],
      description:
        'If this flag is set, all items that have been added or updated in the source before the specified ISO 8601 date or Unix timestamp will be deleted. The documents will be deleted using the default queueDelay, meaning they will stay in the index for about 15 minutes after being marked for deletion.',
      helpValue: '2000-01-01T00:00:00-06:00 OR 946702800',
    }),
    delete: flags.string({
      char: 'x',
      multiple: true,
      description:
        'The URIs of the items to delete. Can be repeated. If you want to delete more than one specific items, use the `source:push:batch` command instead.',
    }),
    deleteChildren: flags.boolean({
      char: 'c',
      default: true,
      description:
        'Whether to delete all items that share the same base URI as the specified item to delete.',
    }),
  };

  public static args = [
    {
      name: 'sourceId',
      required: true,
      description:
        'The identifier of the Push source on which to perform the delete operation. To retrieve the list of available Push source identifiers, use the `source:push:list` command.',
    },
  ];

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(SourcePushDelete);
    if (!flags.deleteOlderThan && !flags.delete) {
      this.error(
        'You must minimally set the `delete` or the `deleteOlderThan` flag. Use `source:push:delete --help` to get more information.'
      );
    }
    const cfg = await new AuthenticatedClient().cfg.get();
    const source = new Source(cfg.accessToken!, cfg.organization);

    if (flags.deleteOlderThan) {
      this.doDeletionOlderThan(source);
      return;
    }

    if (flags.delete) {
      if (this.isNumberOfDeletionTooLarge) {
        this.warn(
          dedent(
            'To delete large number of items, use the `source:push:batch` command instead.'
          )
        );
        return;
      }

      await this.doDeletionDocumentURI(source);
    }
    await this.config.runHook(
      'analytics',
      buildAnalyticsSuccessHook(this, flags)
    );
  }

  private get isNumberOfDeletionTooLarge() {
    return this.flags.delete.length > 20;
  }

  private async doDeletionOlderThan(source: Source) {
    const {flags, args} = this.parse(SourcePushDelete);
    const toDelete = `older than ${flags.deleteOlderThan}`;
    try {
      const isNumber = flags.deleteOlderThan?.match(/^\d+$/);

      const res = await source.deleteDocumentsOlderThan(
        args.sourceId,
        isNumber ? parseInt(flags.deleteOlderThan!, 10) : flags.deleteOlderThan!
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
    return errorMessage(
      this,
      `Error while trying to delete document: ${red(toDelete)}.`,
      e
    );
  }

  private successMessageOnDeletion(toDelete: string, res: AxiosResponse) {
    return successMessage(
      this,
      `The delete request for document: ${green(
        toDelete
      )} was accepted by the push API.`,
      res
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
